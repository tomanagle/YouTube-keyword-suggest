#!/usr/bin/env node
import fs from "fs";
import puppeteer from "puppeteer";
import { flatten } from "lodash";
import axios from "axios";
import cheerio from "cheerio";
import Progress from "./progress";

const args = process.argv.slice(2).join("+");

function sortByFrequency(array: any[]) {
  const frequency = array.reduce((acc, curr) => {
    if (acc[curr]) {
      acc[curr] = acc[curr] + 1;
    } else {
      acc[curr] = 1;
    }

    return acc;
  }, {});

  return Object.keys(frequency).sort(function (a, b) {
    // @ts-ignore
    return b[1] - a[1];
  });
}

const keyword = (args || "youtube keyword tool").replace(/ /g, "+");

const getvids = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.youtube.com/results?search_query=${keyword}`);

  const hrefs = await // @ts-ignore
  (await page.$$eval("a", (as) => as.map((a) => a.href))).filter((link) =>
    link.includes("watch?v=")
  );

  await browser.close();

  return hrefs;
};

async function getVideoKeywords({
  url,
  progress,
}: {
  url: string;
  progress: Progress;
}) {
  const page = await axios.get(url).then((res) => res.data);

  const $ = cheerio.load(page);

  progress.tick();

  return $("meta[name='keywords']").attr("content")?.split(", ");
}

async function main() {
  const links = await getvids();

  const progress = new Progress(links.length);
  progress.start();

  const promises = links.map((link) =>
    getVideoKeywords({ url: link, progress })
  );

  const result = flatten(await Promise.all(promises));

  const content = result.join(", ");

  try {
    fs.writeFileSync(
      `output/${keyword}.txt`,
      sortByFrequency(result).join(", ")
    );
  } catch (err) {
    console.error(err);
  }

  process.exit(0);
}

main();
