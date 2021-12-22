## A JavaScript library that wraps the TM1 REST API written in TypeScript

### Work in progress

This project is currently a work in progress but hoping to release a beta soon! 

### Inspiration

This project is greatly inspired by [TM1py](https://github.com/cubewise-code/tm1py) so make sure to check that out if you haven't already!

### Connect 
``` javascript

    const config = {address: 'localhost', port: 8543, user: 'admin', password: '', ssl: true };
    const tm1 = await TM1Service.connect(config);

    const cube = await tm1.cubes.get('Revenue');

```
