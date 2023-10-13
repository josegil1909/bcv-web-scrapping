import { extract } from "@extractus/article-extractor";
const cheerio = require("cheerio");

const htmlparser2 = require("htmlparser2");

const input = await extract("https://www.bcv.org.ve/");

const output = input.content;

const table1 = output.indexOf("<tbody>");
const table2 = output.indexOf("</tbody>");

const txt = output.substring(table1, table2 + 8); // 8s
// console.log(txt)

let arr = [];
let banco = "";
let compra = null;
let parser = new htmlparser2.Parser({
  onopentag(name, attribs) {
    if (name === "td") {
      let texto = "";
      this.ontext = function (data) {
        texto += data;
      };
      this.onclosetag = function (tagname) {
        if (tagname === "td") {
          texto = texto.trim();
          if (texto !== "") {
            if (texto.includes(",")) {
              texto = texto.replace(",", ".");
              texto = parseFloat(texto);
            }
            if (banco === "") {
              banco = texto;
            } else {
              let obj = {
                banco: banco,
                compra: null,
                venta: null,
              };
              if (compra === null) {
                compra = texto;
              } else {
                obj.compra = compra;
                obj.venta = texto;
                arr.push(obj);
                banco = "";
                compra = null;
              }
            }
          }
        }
      };
    }
  },
});
parser.write(txt);
parser.end();
// console.log(arr);

const promedioCompra =
  arr.reduce((acc, curr) => acc + curr.compra, 0) / arr.length;
const promedioVenta =
  arr.reduce((acc, curr) => acc + curr.venta, 0) / arr.length;

const diferencia = promedioVenta - promedioCompra;

// console.log(`Promedio de compra: ${promedioCompra} `);
// console.log(`Promedio de venta: ${promedioVenta} `);
// console.log(`Diferencia: ${diferencia}`);

// Crear un arreglo vacío para almacenar los objetos
let arr2 = [];

const $ = cheerio.load(output);

// Seleccionar todos los elementos 'div' que contienen los datos
$("div").each(function (i, elem) {
  // Dentro de cada 'div', seleccionar el elemento 'span' que contiene el código de la moneda
  let moneda = $(this).find("span").text().trim();
  // Dentro de cada 'div', seleccionar el elemento 'p' que contiene el elemento 'strong' con el valor de la moneda
  let valor = $(this).find("p strong").text().trim();
  // Si el código y el valor no están vacíos, crear un objeto con esas propiedades
  if (moneda && valor) {
    valor = valor.replace(",", ".");
    valor = parseFloat(valor);
    let obj = {
      moneda: moneda,
      valor: valor,
    };
    // Añadir el objeto al arreglo
    arr2.push(obj);
  }
});

// Mostrar el resultado en la consola

const filteredArr = arr2.filter((obj, index) => {
  // Devolver solo los elementos con índice mayor o igual a 2
  return index >= 2;
});
// console.log(filteredArr);

const result = {
  BCV: filteredArr,
  Bancos: arr,
  promedioCompra: promedioCompra,
  promedioVenta: promedioVenta,
  Diferencia: diferencia,
};

export default result;

// console.log(result);
