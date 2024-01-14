// src/index.js

const { parseQuery, parseJoinClause } = require('./queryParser');
const readCSV = require('./csvReader');

// src/index.js
function evaluateCondition(row, clause) {
    const { field, operator, value } = clause;
    switch (operator) {
        case '=': return row[field] === value;
        case '!=': return row[field] !== value;
        case '>': return row[field] > value;
        case '<': return row[field] < value;
        case '>=': return row[field] >= value;
        case '<=': return row[field] <= value;
        default: throw new Error(`Unsupported operator: ${operator}`);
    }
}

async function executeSELECTQuery(query) {
    // Now we will have joinTable, joinCondition in the parsed query

    const { fields, table, whereClauses, joinType, joinTable, joinCondition } = parseQuery(query);
    let data = await readCSV(`${table}.csv`);

    // Logic for applying JOINs
    if (joinTable && joinCondition) {
        const joinData = await readCSV(`${joinTable}.csv`);
        switch (joinType.toUpperCase()) {
            case 'INNER':
                data = await performInnerJoin(data, joinData, joinCondition, fields, table);
                break;
            case 'LEFT':
                data = await performLeftJoin(data, joinData, joinCondition, fields, table);
                break;
            case 'RIGHT':
                data = await performRightJoin(data, joinData, joinCondition, fields, table);
                break;
            // Handle default case or unsupported JOIN types
        }
    }
    // console.log(data);
    // Apply WHERE clause filtering
    const filteredData = whereClauses && whereClauses.length > 0
        ? data.filter(row => whereClauses.every(clause => evaluateCondition(row, clause)))
        : data;

    // Select the specified fields
    return filteredData.map(row => {
        const selectedRow = {};
        fields.forEach(field => {
            selectedRow[field] = row[field];
        });
        return selectedRow;
    });
}


// Helper functions for different JOIN types
async function performInnerJoin(data, joinData, joinCondition, fields, table) {
    // Logic for INNER JOIN
    data = data.flatMap(mainRow => {
        return joinData
            .filter(joinRow => {
                const mainValue = mainRow[joinCondition.left.split('.')[1]];
                const joinValue = joinRow[joinCondition.right.split('.')[1]];
                return mainValue === joinValue;
            })
            .map(joinRow => {
                return fields.reduce((acc, field) => {
                    const [tableName, fieldName] = field.split('.');
                    acc[field] = tableName === table ? mainRow[fieldName] : joinRow[fieldName];
                    return acc;
                }, {});
            });
    });
    return data;
}

async function performLeftJoin(data, joinData, joinCondition, fields, table) {
    const result = data.map(mainRow => {
        const matchingRows = joinData.filter(joinRow => {
            const mainValue = mainRow[joinCondition.left.split('.')[1]];
            const joinValue = joinRow[joinCondition.right.split('.')[1]];
            return mainValue === joinValue;
        });
        // console.log(matchingRows.length);
        if (matchingRows.length === 0) {
            // If no match found in joinData, create a row with null values for joinData fields
            return {
                ...fields.reduce((acc, field) => {
                    const [tableName, fieldName] = field.split('.');
                    acc[field] = tableName === table ? mainRow[fieldName] : null;
                    return acc;
                }, {}),
            };
        }

        return matchingRows.map(joinRow => {
            return fields.reduce((acc, field) => {
                const [tableName, fieldName] = field.split('.');
                acc[field] = tableName === table ? mainRow[fieldName] : joinRow[fieldName];
                return acc;
            }, {});
        });
    }).flat();
    
    return result;
}


async function performRightJoin(data, joinData, joinCondition, fields, table) {
    const result = joinData.map(joinRow => {
        const matchingRows = data.filter(mainRow => {
            const mainValue = mainRow[joinCondition.left.split('.')[1]];
            const joinValue = joinRow[joinCondition.right.split('.')[1]];
            return mainValue === joinValue;
        });

        return matchingRows.length > 0
            ? matchingRows.map(mainRow => {
                return fields.reduce((acc, field) => {
                    const [tableName, fieldName] = field.split('.');
                    acc[field] = tableName === table ? mainRow[fieldName] : joinRow[fieldName];
                    return acc;
                }, {});
            })
            : {
                ...fields.reduce((acc, field) => {
                    const [tableName, fieldName] = field.split('.');
                    acc[field] = tableName === table ? null : joinRow[fieldName];
                    return acc;
                }, {}),
            };
    }).flat();
    // console.log(result);
    return result;
}



module.exports = executeSELECTQuery;