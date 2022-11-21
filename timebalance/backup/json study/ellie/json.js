let json = JSON.stringify(true);

json = JSON.stringify(['apple', 'banana']);

const rabbit = {
    name: 'tori',
    color: 'white',
    size: null,
    birthDate: new Date(),
    symbol: Symbol('id'),
    jump: () => {
    },
};

json = JSON.stringify(rabbit);

json = JSON.stringify(rabbit, ['name', 'color', 'size']);







console.clear();
json = JSON.stringify(rabbit);
const obj = JSON.parse(json, (key, value) => {
    return key === 'birthDate' ? new Date(value) : value; 
});
rabbit.jump();
// obj.jump();