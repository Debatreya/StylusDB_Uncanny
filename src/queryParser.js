// src/queryParser.js

function parseQuery(query) {
    // First, let's trim the query to remove any leading/trailing whitespaces
    query = query.trim();

    // Initialize variables for different parts of the query
    let selectPart;

    // Split the query at the WHERE clause if it exists
    const whereSplit = query.split(/\sWHERE\s/i);
    query = whereSplit[0]; // Everything before WHERE clause

    // WHERE clause is the second part after splitting, if it exists
    const whereClause = whereSplit.length > 1 ? whereSplit[1].trim() : null;

    // Split the remaining query at the JOIN clause if it exists
    const joinSplit = query.split(/\b(INNER JOIN|LEFT JOIN|RIGHT JOIN)\b/i);
    // console.log(joinSplit);
    selectPart = joinSplit[0].trim(); // Everything before JOIN clause (SELECT + FROM)

    // JOIN clause is the second part after splitting, if it exists
    const joinPart = joinSplit.length > 1 ? (joinSplit[2]).trim() : null;

    // Parse the SELECT part
    const selectRegex = /^SELECT\s(.+?)\sFROM\s(.+)/i;
    const selectMatch = selectPart.match(selectRegex);
    if (!selectMatch) {
        throw new Error('Invalid SELECT format');
    }

    const [, fields, table] = selectMatch;

    // Parse the JOIN part if it exists
    let joinTable = null, joinCondition = null, joinType = null;
    if (joinPart) {
        joinType = joinSplit[1].match(/\b(INNER|RIGHT|LEFT)\b/i)[0].trim();
        // console.log(joinType);
        ({ joinTable, joinCondition } = parseJoinClause(joinPart));
    }


    // Parse the WHERE part if it exists
    let whereClauses = [];
    if (whereClause) {
        whereClauses = parseWhereClause(whereClause);
    }

    return {
        fields: fields.split(',').map(field => field.trim()),
        table: table.trim(),
        whereClauses,
        joinType,
        joinTable,
        joinCondition
    };
}

// src/queryParser.js
function parseWhereClause(whereString) {
    const conditionRegex = /(.*?)(=|!=|>|<|>=|<=)(.*)/;
    return whereString.split(/ AND | OR /i).map(conditionString => {
        const match = conditionString.match(conditionRegex);
        if (match) {
            const [, field, operator, value] = match;
            return { field: field.trim(), operator, value: value.trim() };
        }
        throw new Error('Invalid WHERE clause format');
    });
}


function parseJoinClause(query) {
    // console.log(query);
    const joinRegex = /\s*([\w.]+)\s*ON\s*([\w.]+)\s*=\s*([\w.]+)/i;
    const joinMatch = query.match(joinRegex);
    // console.log(joinMatch);
    if (joinMatch) {
        return {
            joinTable: joinMatch[1].trim(),
            joinCondition: {
                left: joinMatch[2].trim(),
                right: joinMatch[3].trim()
            }
        };
    }

    return {
        joinTable: null,
        joinCondition: null
    };
}

// Update the parseQuery function to use parseJoinClause

module.exports = { parseQuery, parseJoinClause };