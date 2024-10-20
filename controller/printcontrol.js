
const { db, getpurchesesinvoicebyid, getpurcheseitembyid } = require('./db');







const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');


const topdf = async (req,res) => {

 console.log("0");                                                   
    const templatePath = path.join(__dirname,'..', 'views', 'purchases', 'pdftamplet.ejs'); 
    const invoiceid = req.params.id;
    const outputPath = path.join(__dirname, `../public/output/pdfinvoice_${invoiceid}.pdf`);
   
    const invoice = await getpurchesesinvoicebyid(invoiceid);
    const items = await getpurcheseitembyid(invoiceid);
    const data = { invoice, items };
    console.log("id"+invoiceid);
   async function renderEjsToHtml() {
        return new Promise((resolve, reject) => {
            ejs.renderFile(templatePath, { invoice: data.invoice, items: data.items }, (err, html) => {
                if (err) {
                    return reject(err);
                }
                resolve(html);
            });
        });
    }

    // Funktion zur Konvertierung von HTML zu PDF
    async function htmlToPdf(html) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.setContent(html, { waitUntil: 'load' });
        await page.pdf({ path: outputPath, format: 'A4' });
        
        await browser.close();
    }


    // Selbstaufrufende Funktion (IIFE)
    (async () => {
        try {
            const html = await renderEjsToHtml();
            await htmlToPdf(html);
            console.log('PDF wurde erfolgreich erstellt:', outputPath);

            exec(`start "" "${outputPath}"`, (error) => {
                if (error) {
                    console.error(`Fehler beim Öffnen der PDF: ${error}`);
                }
            });


        } catch (error) {
            console.error('Es ist ein Fehler aufgetreten:', error);
        }
    })();
};

module.exports = {
topdf
};