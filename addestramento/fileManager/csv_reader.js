/**
 * File name: csv_reader.js
 * Date: 2020-03-23
 *
 * @file classe per la lettura del file CSV
 * @author Carbon12 <carbon.dodici@gmail.com>
 * @version X.Y.Z
 *
 * Changelog: sistemata lettura dati
 */

const fs = require('fs');
const parse = require('csv-parse/lib/sync');

module.exports = class csvReader {
    /**
     * @param {string} path Percorso da cui viene caricato il file.
     * @param {object} options Le opzioni passate al lettore di csv. Vedi: https://csv.js.org/parse/options/
     */

    constructor(path, options) {
        const input = fs.readFileSync(path, 'utf8');
        let readOptions = options;
        // opzioni di default per csv
        if (options == null) {
            readOptions = {
                delimiter: ';',
                bom: true,
                columns: true,
                skip_empty_lines: true,
            };
        }

        // converte il csv in una matrice: records[i]=riga i, records[i][nomeColonna]=valore nella cella in riga i e colonna nomeColonna
        this.records = parse(input, readOptions);

        // controllo da fare nel caso il csv sia vuoto
        if (this.records.length > 0) {
            // columns contiene un vettore di stringhe, ogni stringa è un nome di una colonna del csv
            this.columns = Object.keys(this.records[0]);
        }
    }

    /**
     * @returns {Boolean} Ritorna true se la prima colonna ha etichetta Time e l'ultima Labels
     */
    checkStructure() {
        const columnsLength = this.columns.length - 1;
        return this.columns[0] === 'Time' && this.columns[columnsLength] === 'Labels';
    }

    /**
     *
     * @return dati per il grafico
     */
    getDataGraph() {
        // seleziona tutte le colonne, eccetto quella delle data entry(Series), delle Labels e quella vuota che mette grafana
        const dataColumns = [];
        this.columns.forEach((element) => {
            if ((!(element === 'Labels')) && (!(element === 'Time'))) {
                dataColumns.push(element);
            }
        });

        const res = [];
        let i = 0;
        this.records.forEach((row) => {
            const validRow = [];
            let c = 0;
            for (const key in row) {
                if (dataColumns.includes(key)) {
                    // per ogni riga del csv, prendo i valori nelle colonne che sono specificate in columns
                    // in validRow alla fine del ciclo sarà presente la riga corrente con solo le colonne valide
                    let count = 0;
                    let ji = 0;
                    for (ji; ji < row[key].length; ji++) {
                        if (row[key].charAt(ji) === '.') {
                            count++;
                        }
                    }
                    if (count > 1) {
                        let st = row[key];
                        for (let dot = 1; dot <= count; dot++) {
                            st = st.replace('.', '');
                        }
                        validRow[c++] = st;
                    } else {
                        validRow[c++] = row[key];
                    }
                }
            }
            res[i++] = validRow;
        });
        // converte i valori ottenuti nel giusto formato
        for (let k = 0; k < res.length; k++) {
            // converte i valori in float
            for (let j = 0; j < res[k].length; j++) {
                if (res[k][j] === 'null') {
                    res[k][j] = 0;
                } else {
                    res[k][j] = parseFloat(res[k][j]) / 1000000;
                }
            }
        }
        return res;
    }

    /**
     *
     * @param {Array} columns Lista di colonne da ritornare.
     * @returns {Array} Ritorna la matrice contenente ogni riga di ogni colonna selezionata.
     */
    getData(columns) {
        if (columns == null) {
            return null;
        }

        const res = [];
        let i = 0;
        this.records.forEach((row) => {
            const validRow = [];
            let c = 0;
            for (const key in row) {
                if (columns.includes(key)) {
                    validRow[c++] = row[key];
                    // per ogni riga del csv, prendo i valori nelle colonne che sono specificate in columns
                    // in validRow alla fine del ciclo sarà presente la riga corrente con solo le colonne valide
                }
            }
            res[i++] = validRow;
        });
        return res;
    }

    /**
     * @returns {Array} Ritorna una matrice contenente i dati.
     * Converte i numeri in float, i null in 0 e le date in secondi.
     */
    autoGetData() {
        // seleziona tutte le colonne, eccetto quella delle data entry(Series), delle Labels e quella vuota che mette grafana
        const dataColumns = [];
        this.columns.forEach((element) => {
            if ((!(element === 'Labels')) && (!(element === 'Time'))) {
                dataColumns.push(element);
            }
        });
        const res = this.getData(dataColumns);

        // converte i valori ottenuti nel giusto formato
        for (let i = 0; i < res.length; i++) {
            // converte i valori in float
            for (let j = 0; j < res[i].length; j++) {
                if (res[i][j] === 'null') {
                    res[i][j] = 0;
                } else {
                    res[i][j] = parseFloat(res[i][j]);
                }
            }
        }
        return res;
    }

    /**
     * @returns {Array} Ritorna un vettore contenente le Labels
     * Ritorna un vettore contenente le Label già convertite in int.
     */
    autoGetLabel() {
        // usa getData per ottenere la colonna delle Labels
        const labCol = [];
        labCol[0] = 'Labels';
        const res = this.getData(labCol);

        // converte le Label da String a int
        for (let i = 0; i < res.length; i++) {
            res[i] = parseInt(res[i]);
        }
        return res;
    }

    /**
     * @returns {Array} Ritorna un vettore contenente i nomi delle sorgenti di dati.
     */
    getDataSource() {
        const res = [];
        this.columns.forEach((element) => {
            if (!(element === 'Labels' || element === 'Time')) {
                res.push(element);
            }
        });
        return res;
    }

    /**
     * @returns {int} Ritorna il numero di sorgenti.
     */
    countSource() {
        return this.getDataSource().length;
    }
};
