
const { db, getpurchesesinvoicebyid, getpurcheseitem,getSupplierData,getuserbyid ,getStoreData ,getSupplierbyid ,getInvoiceItemsById,getInvoiceById} = require('./db');







const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const printer = require('pdf-to-printer');

const topdf = async (req,res) => {

 console.log("0");                                                   
    const templatePath = path.join(__dirname,'..', 'views', 'purchases', 'pdftamplet.ejs'); 
    const invoiceid = req.params.id;
    const outputPath = path.join(__dirname, `../public/output/purchases/pdfinvoice_${invoiceid}.pdf`);
    
    const invoice = await getpurchesesinvoicebyid(invoiceid);
    const items = await getpurcheseitem(invoiceid);
  const user= await getuserbyid (invoice[0].employee_id);
   
    const store = await getStoreData();

    const supplierdata=await getSupplierbyid(invoice[0].supplierID);
 console.log("supplierdata",JSON.stringify(supplierdata));
 console.log("store",JSON.stringify(store));
 console.log(" user",JSON.stringify( user));
 console.log("items ",JSON.stringify(items ));
 console.log(" invoice",JSON.stringify( invoice));

 
    console.log("id"+invoiceid);
   async function renderEjsToHtml() {
        return new Promise((resolve, reject) => {
            ejs.renderFile(templatePath, { invoice, items,supplierdata,store,user  }, (err, html) => {
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





const salestopdf = async (req,res) => {

    console.log("0");                                                   
       const templatePath = path.join(__dirname,'..', 'views', 'sales', 'pdftamplet.ejs'); 
       const invoiceid = req.params.id;
       const outputPath = path.join(__dirname, `../public/output/sales/pdfinvoice_${invoiceid}.pdf`);
       
       const invoice = await getInvoiceById(invoiceid);
       const items = await getInvoiceItemsById(invoiceid);
       console.log(" invoice",JSON.stringify( invoice));
     const user= await getuserbyid (invoice.employee_id);
      
       const store = await getStoreData();
   
     


    console.log("store",JSON.stringify(store));
    console.log(" user",JSON.stringify( user));
    console.log("items ",JSON.stringify(items ));

   
    
       console.log("id"+invoiceid);
      async function renderEjsToHtml() {
           return new Promise((resolve, reject) => {
               ejs.renderFile(templatePath, { invoice, items,store,user  }, (err, html) => {
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
   //return  res.redirect("viewinvoicepage/"+invoiceid);
   
           } catch (error) {
               console.error('Es ist ein Fehler aufgetreten:', error);
           }
       })();
   };


//================================================================================






const salestopdfprint = async (req, res) => {

    console.log("0");                                                   
    const templatePath = path.join(__dirname, '..', 'views', 'sales', 'pdftamplet.ejs'); 
    const invoiceid = req.params.id;
    const outputPath = path.join(__dirname, `../public/output/sales/pdfinvoice_${invoiceid}.pdf`);

    const invoice = await getInvoiceById(invoiceid);
    const items = await getInvoiceItemsById(invoiceid);
    console.log("invoice", JSON.stringify(invoice));
    const user = await getuserbyid(invoice.employee_id);
    const store = await getStoreData();

    console.log("store", JSON.stringify(store));
    console.log("user", JSON.stringify(user));
    console.log("items", JSON.stringify(items));
    console.log("id", invoiceid);

    async function renderEjsToHtml() {
        return new Promise((resolve, reject) => {
            ejs.renderFile(templatePath, { invoice, items, store, user }, (err, html) => {
                if (err) {
                    return reject(err);
                }
                resolve(html);
            });
        });
    }

    async function htmlToPdf(html) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.setContent(html, { waitUntil: 'load' });
        await page.pdf({ path: outputPath, format: 'A4' });
        
        await browser.close();
    }

    // Print the PDF directly
    async function printPdf(filePath) {
        try {
            await printer.print(filePath);
            console.log(`PDF sent to printer successfully: ${filePath}`);
        } catch (error) {
            console.error(`Error while printing the PDF: ${error}`);
        }
    }

    // IIFE (Self-invoking function)
    (async () => {
        try {
            const html = await renderEjsToHtml();
            await htmlToPdf(html);
            console.log('PDF was successfully created:', outputPath);

            // Send the PDF directly to the printer
            await printPdf(outputPath);

          return res.redirect("/viewinvoicepage/"+invoiceid);

        } catch (error) {
            console.error('An error occurred:', error);
            res.status(500).json({ message: 'Error generating or printing PDF.', error });
        }
    })();
};




//****** 



const topdfprint = async (req, res) => {

    console.log("0");
    const templatePath = path.join(__dirname, '..', 'views', 'purchases', 'pdftamplet.ejs');
    const invoiceid = req.params.id;
    const outputPath = path.join(__dirname, `../public/output/purchases/pdfinvoice_${invoiceid}.pdf`);

    const invoice = await getpurchesesinvoicebyid(invoiceid);
    const items = await getpurcheseitem(invoiceid);
    const user = await getuserbyid(invoice[0].employee_id);
    const store = await getStoreData();
    const supplierdata = await getSupplierbyid(invoice[0].supplierID);

    console.log("supplierdata", JSON.stringify(supplierdata));
    console.log("store", JSON.stringify(store));
    console.log("user", JSON.stringify(user));
    console.log("items", JSON.stringify(items));
    console.log("invoice", JSON.stringify(invoice));
    console.log("id " + invoiceid);

    async function renderEjsToHtml() {
        return new Promise((resolve, reject) => {
            ejs.renderFile(templatePath, { invoice, items, supplierdata, store, user }, (err, html) => {
                if (err) {
                    return reject(err);
                }
                resolve(html);
            });
        });
    }

    async function htmlToPdf(html) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        await page.setContent(html, { waitUntil: 'load' });
        await page.pdf({ path: outputPath, format: 'A4' });
        
        await browser.close();
    }

    async function printPdf(filePath) {
        try {
            await printer.print(filePath);
            console.log(`PDF sent to printer successfully: ${filePath}`);
        } catch (error) {
            console.error(`Error while printing the PDF: ${error}`);
        }
    }

    (async () => {
        try {
            const html = await renderEjsToHtml();
            await htmlToPdf(html);
            console.log('PDF was successfully created:', outputPath);

            // Send the PDF directly to the printer
            await printPdf(outputPath);

            return res.redirect("/viewpurchesinvoice/"+invoiceid);

        } catch (error) {
            console.error('An error occurred:', error);
            res.status(500).json({ message: 'Error generating or printing PDF.', error });
        }
    })();
};












//=================================================================================



module.exports = {
topdf,salestopdf,salestopdfprint, topdfprint
};