const { parseQuery } = require('../src/queryParser');

test('Parse SQL Query', () => {
    const query = 'SELECT id, name FROM student';
    const parsed = parseQuery(query);
    // console.log(parsed);
    expect(parsed).toEqual({
        fields: ['id', 'name'],
        table: 'student',
        whereClauses: [],
        joinType: null,
        joinTable: null,
        joinCondition: null
    });
});

test('Parse SQL Query with Multiple WHERE Clauses', () => {
    const query = 'SELECT id, name FROM student WHERE age = 30 AND name = John';
    const parsed = parseQuery(query);
    // console.log(parsed);
    expect(parsed).toEqual({
        fields: ['id', 'name'],
        table: 'student',
        whereClauses: [{
            "field": "age",
            "operator": "=",
            "value": "30",
        }, {
            "field": "name",
            "operator": "=",
            "value": "John",
        }],
        joinType: 'INNER',
        joinTable: null,
        joinCondition: null
    });
});


test('Parse SQL Query with INNER JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id';
    const parsed = parseQuery(query);
    expect(parsed).toEqual(
        {
            "fields": ["student.name", "enrollment.course"],
            "table": "student",
            "whereClauses": [],
            "joinTable": "enrollment",
            "joinCondition": {
                "left": "student.id",
                "right": "enrollment.student_id"
            }
        }
    )
});

test('Parse SQL Query with INNER JOIN and WHERE Clause', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id WHERE student.name = John';
    const parsed = parseQuery(query);
    expect(parsed).toEqual(
        {
            "fields": ["student.name", "enrollment.course"],
            "table": "student",
            "whereClauses": [{
                "field": "student.name",
                "operator": "=",
                "value": "John"
            }],
            "joinTable": "enrollment",
            "joinCondition": {
                "left": "student.id",
                "right": "enrollment.student_id"
            }
        }
    )
});

