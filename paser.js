const fs = require('fs');
const { PDFParse } = require('pdf-parse'); 

async function extractLaws() {
    try {
        console.log("Reading PDF...");
        let dataBuffer = fs.readFileSync('cama.pdf');
        
        const parser = new PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        const fullText = result.text;
        
        // Slightly looser regex to catch variations in how the government typed the numbers
        const sectionRegex = /(?:^|\n)\s*(\d+)\.\s*(.*?)(?=\n\s*\d+\.\s*|$)/gs;
        let match;
        
        // We use a Map to keep track of the longest text found for each section
        const lawsMap = new Map();

        while ((match = sectionRegex.exec(fullText)) !== null) {
            const sectionNum = match[1];
            const textBody = match[2].trim();
            
            // If we haven't seen this section, OR if this new text is longer than the one we have, save it.
            // This guarantees we overwrite the short Table of Contents entry with the real, long law!
            if (!lawsMap.has(sectionNum) || textBody.length > lawsMap.get(sectionNum).length) {
                lawsMap.set(sectionNum, textBody);
            }
        }

        const allLaws = [];
        for (const [sectionNum, textBody] of lawsMap.entries()) {
            // Only keep sections with substantial text
            if (textBody.length > 50) {
                allLaws.push({
                    act_name: "CAMA 2020",
                    section: sectionNum,
                    text: textBody.substring(0, 800).replace(/\s+/g, ' '), 
                    has_been_used: false
                });
            }
        }

        // Sort them numerically so they are in perfect order in your database
        allLaws.sort((a, b) => parseInt(a.section) - parseInt(b.section));

        fs.writeFileSync('all_cama_laws.json', JSON.stringify(allLaws, null, 2));
        console.log(`Successfully extracted ${allLaws.length} REAL sections into all_cama_laws.json!`);
        
        await parser.destroy();
    } catch (error) {
        console.error("Error parsing PDF:", error);
    }
}

extractLaws();