#!/usr/bin/env node

import puppeteer from "puppeteer";
import clear from "clear";
import { program } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import { mkdirSync, existsSync } from "fs";
import path from "path";
import dayjs from "dayjs";
import "dayjs/locale/th";

clear();
console.log(
  chalk.red(figlet.textSync("WEB SCREENSHOT", { horizontalLayout: "full" }))
);

program
  .version("0.0.1")
  .description("An example CLI for take screenshot")
  .option("-u, --url <weburl>", "URL for take screenshot")
  .option("-fp, --fullpage", "Take screenshor fullpage", true)
  .option("-t, --timeout <ms>", "Navaigation timeout to url", "0")
  .option(
    "-o, --output <path>",
    "Output path for image",
    path.join(process.cwd(), "output_ss")
  )
  .parse(process.argv);

async function run(
  webUrl: string,
  options: {
    fullPage: boolean;
    outputPath: string;
    timeout: number;
  }
) {
  console.log(`screenshot web ${webUrl} is processing...`);
  let browser = await puppeteer.launch({ headless: true });

  try {
    let page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(webUrl, {
      waitUntil: "load",
      timeout: options.timeout
    });

    await page.waitFor(3000);

    await page.screenshot({
      path: `${options.outputPath}/ss_${dayjs()
        .locale("th")
        .format("YYYYMMDD_HHmmss")}.jpg`,
      fullPage: options.fullPage
    });
  } catch (err) {
    throw err;
  } finally {
    await browser.close();
  }
  console.log(`screenshot web ${webUrl} is done!!~`);
}

(async () => {
  if (program.url) {
    if (program.output) {
      // check output dir exist or not
      if (!existsSync(program.output)) {
        mkdirSync(program.output);
      }
    }

    run(program.url, {
      fullPage: program.fullpage,
      outputPath: program.output,
      timeout: +program.timeout
    });
  }

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
})();
