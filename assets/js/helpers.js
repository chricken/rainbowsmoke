'use strict';

const helpers = {
    leading0(num = 0, dec = 6) {
        let lead = '00000000000000' + num;
        return lead.substr(-dec);
    },
    createNumber(min, max) {
        return ~~(Math.random() * (max - min + 1) + min);
    },
    pythagorasPoints(pt1, pt2) {
        let x = pt1.x - pt2.x;
        let y = pt1.y - pt2.y;
        let distance = Math.sqrt(x ** 2 + y ** 2);
        return distance;
    }
}

export default helpers;
export let rnd = helpers.createNumber;