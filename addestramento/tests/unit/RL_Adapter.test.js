/**
 * File name: RL_Adapter.test.js
 * Date: 2020-03-18
 *
 * @file Test metodi della classe RL_Adapter
 * @author Carbon12 <carbon.dodici@gmail.com>
 * @version X.Y.Z
 *
 * Changelog: modifiche effettuate
 */

const RLAdapter = require('../../models/RL_Adapter');

const rlAdapter = new RLAdapter({ numX: 3, numY: 1 });

test('It should return JSON file with RL configuration', () => {
    const data = [
        [9098, 5492],
        [9133, 5540],
        [9203, 5305],
        [9308, 5507],
        [9448, 5418],
        [9623, 5320],
        [9833, 5538],
    ];
    const labels = [5400, 5462, 5524, 5586, 5648, 5710, 5772];

    const k = {};
    k._parametroN = 'numero di dati inseriti';
    k.N = 7;
    k._parametroD = 'numero di sorgenti analizzate';
    k.D = 3;
    k._parametroAlpha = 'coefficienti della retta risultante';
    k.alpha = [
        [1921.8840693868697],
        [0.4748198607372416],
        [-0.14483769841581307],
    ];

    expect(rlAdapter.train(data, labels)).toEqual(k);
});
