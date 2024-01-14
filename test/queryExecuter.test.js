const executeSELECTQuery = require('../src/index');

test('Execute SQL Query', async () => {
    const query = 'SELECT id, name FROM student';
    const result = await executeSELECTQuery(query);
    // console.log(result);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).not.toHaveProperty('age');
    expect(result[0]).toEqual({ id: '1', name: 'John' });
});


test('Execute SQL Query with WHERE Clause', async () => {
    const query = 'SELECT id, name FROM student WHERE age = 25';
    const result = await executeSELECTQuery(query);
    expect(result.length).toBe(1);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0].id).toBe('2');
});

test('Execute SQL Query with Multiple WHERE Clause', async () => {
    const query = 'SELECT id, name FROM student WHERE age = 30 AND name = John';
    const result = await executeSELECTQuery(query);
    expect(result.length).toBe(1);
    expect(result[0]).toEqual({ id: '1', name: 'John' });
});

test('Execute SQL Query with Greater Than', async () => {
    const queryWithGT = 'SELECT id FROM student WHERE age > 22';
    const result = await executeSELECTQuery(queryWithGT);
    expect(result.length).toEqual(3);
    expect(result[0]).toHaveProperty('id');
});

test('Execute SQL Query with Not Equal to', async () => {
    const queryWithGT = 'SELECT name FROM student WHERE age != 25';
    const result = await executeSELECTQuery(queryWithGT);
    expect(result.length).toEqual(3);
    expect(result[0]).toHaveProperty('name');
});

test('Execute SQL Query with INNER JOIN', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id';
    const result = await executeSELECTQuery(query);
    console.log(result);
    expect(result).toEqual(
        [
            { 'student.name': 'John', 'enrollment.course': 'Mathematics' },
            { 'student.name': 'John', 'enrollment.course': 'Physics' },
            { 'student.name': 'Jane', 'enrollment.course': 'Chemistry' },
            { 'student.name': 'Bob', 'enrollment.course': 'Mathematics' }
        ]
    );
});

test('Execute SQL Query with INNER JOIN and a WHERE Clause', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student INNER JOIN enrollment ON student.id=enrollment.student_id WHERE student.name = John';
    const result = await executeSELECTQuery(query);
    console.log(result);
    expect(result).toEqual(
        [
            { 'student.name': 'John', 'enrollment.course': 'Mathematics' },
            { 'student.name': 'John', 'enrollment.course': 'Physics' }
        ]
    );
});


test('Execute SQL Query with LEFT JOIN and a WHERE Clause', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student LEFT JOIN enrollment ON student.id=enrollment.student_id';
    const result = await executeSELECTQuery(query);
    // console.log(result);
    expect(result).toEqual(
        [
            {
              'student.name': 'John',
              'enrollment.course': 'Mathematics'
            },
            {
              'student.name': 'John',
              'enrollment.course': 'Physics'
            },
            {
              'student.name': 'Jane',
              'enrollment.course': 'Chemistry'
            },
            {
              'student.name': 'Bob',
              'enrollment.course': 'Mathematics'
            },
            {
              'student.name': 'Alice',
              'enrollment.course': null
            }
          ]
    );
});


test('Execute SQL Query with RIGHT JOIN and a WHERE Clause', async () => {
    const query = 'SELECT student.name, enrollment.course FROM student RIGHT JOIN enrollment ON student.id=enrollment.student_id';
    const result = await executeSELECTQuery(query);
    // console.log(result);
    expect(result).toEqual(
        [
            {
              'student.name': 'John',
              'enrollment.course': 'Mathematics'
            },
            {
              'student.name': 'John',
              'enrollment.course': 'Physics'
            },
            {
              'student.name': 'Jane',
              'enrollment.course': 'Chemistry'
            },
            {
              'student.name': 'Bob',
              'enrollment.course': 'Mathematics'
            },
            {
              'student.name': null,
              'enrollment.course': 'Biology'
            }
          ]
    );
});