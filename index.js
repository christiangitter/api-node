//Der Port auf dem der Server läuft
const PORT = 8000;
//die benötigten Packages, die über npm installiert werden müssen
//express: WebFramework um Inhalte im Browser darzustellen
//axios: Handled die HTTP-Requests
//cheerio: parsed die Website
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { response } = require("express");

const app = express();

//Hier werden die Seiten festgelegt, die berücksichtigt werden sollen
const sites = [
  {
    name: "t3n",
    address: "https://t3n.de/news/",
    base: "",
  },
  {
    name: "giga",
    address: "https://www.giga.de/tech/news/",
    base: "https:",
  },
];
//alle Artikel werden in das Array artikel geladen
const artikel = [];

//jede Seite im Array sites wird nach dem Schlagwort im a-tag durchsucht, geparsed und mit den Parameter title und URL geladen in das Artikel-Array geladen.
sites.forEach((site) => {
  axios.get(site.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);
    $('a:contains("Krypto")', html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");
      artikel.push({
        title,
        url: site.base + url,
        Quelle: site.name,
      });
    });
  });
});

//hier wird die Willkommensseite erstellt
app.get("/", function (req, res) {
  res.json("Willkommen zu meiner Tech-News API");
});

//wenn hinter dem Port /news geschrieben wird, wird das Artikel-Array als JSON ausgegeben
app.get("/news", function (req, res) {
  res.json(artikel);
});

//wenn hinter dem Port /news/:siteID geschrieben wird werden die Site-spezifischen Artikel ausgegeben
app.get("/news/:siteID", async (req, res) => {
  const siteID = req.params.siteID;
  const seitenadresse = sites.filter((site) => site.name == siteID)[0].address;
  const seitenadressebase = sites.filter((site) => site.name == siteID)[0].base;

  axios
    .get(seitenadresse)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];
      $('a:contains("Krypto")', html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");
        specificArticles.push({
          title,
          url: seitenadressebase + url,
          source: siteID,
        });
      });
      res.json(specificArticles);
    })
    .catch((err) => console.log(err));
});

//hier wird der Port der App zugewiesen
app.listen(PORT, () => console.log(`Server läuft auf PORT ${PORT}`));
