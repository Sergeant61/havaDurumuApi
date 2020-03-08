import express from "express";
import bodyParser from "body-parser";
import BeautifulDom from "beautiful-dom";
import request from "request";
import fs from "fs";
import { Ulke } from "./UlkeClass";
import { Il } from "./IlClass";
import { HavaDurumu } from "./HavaDurumuClass";
import { HavaGun } from "./HavaGunClass";
import { HavaOlaylari } from "./HavaOlaylari";

let port = 8081; // default port to listen

let app = express();
//const urlEncodedParser = bodyParser.urlencoded({ extended: true });

let ulkeList: Array<Ulke>

fs.readFile("./src/json/ulkeler.json", "utf8", function (hata, data) {
	if (hata) {
		throw hata;
	}
	ulkeList = JSON.parse(data);
});


let havaOlaylariList: Array<HavaOlaylari>

fs.readFile("./src/json/havaOlaylari.json", "utf8", function (hata, data) {
	if (hata) {
		throw hata;
	}
	havaOlaylariList = JSON.parse(data);
});

//http://localhost:8081/ulkeler 
app.get("/ulkeler", function (req, response) {

	response.writeHead(200, { "Content-Type": "application/json" });
	response.write(JSON.stringify(ulkeList));
	response.end("");

});

//http://localhost:8081/iller?ulke=ABD
app.get("/iller", function (req, response) {

	let getUlke = req.query.ulke
	let isOkey: boolean = false

	for (let i = 0; i < ulkeList.length; i = i + 1) {

		if (getUlke === ulkeList[i].name) {
			isOkey = true

			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

			request('https://www.havadurumu15gunluk.net' + ulkeList[i].url, function (error, res, body) {

				let dom = new BeautifulDom(body)

				let tableList = dom.getElementsByTagName("table");
				let optionsList = tableList[4].getElementsByTagName("option")

				let ilList: Il[] = new Array()

				for (let k = 145; k < optionsList.length; k = k + 1) {

					let outerHTML = optionsList[k].outerHTML

					let indexB = outerHTML.indexOf("\"")
					let indexL = outerHTML.lastIndexOf("\"")

					let url = outerHTML.substring(indexB + 1, indexL)

					const il: Il = new Il(optionsList[k].innerText, url);
					ilList.push(il)
				}

				response.writeHead(200, { "Content-Type": "application/json" });
				response.write(JSON.stringify(ilList));
				response.end("");
			});
			break
		}
	}

	if (!isOkey) {
		response.writeHead(404, { "Content-Type": "application/json" });
		response.write("Hata");
		response.end("");
	}

});

//http://localhost:8081/hava_durumu?ilUrl=/abd/abbeville-hava-durumu-15-gunluk.html
app.get("/hava_durumu", function (req, response) {

	let getIl: string = req.query.ilUrl
	let isCelcius: string = req.query.isCelcius
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

	request('https://www.havadurumu15gunluk.net' + getIl, function (error, res, body) {

		let dom = new BeautifulDom(body)
		let tableList = dom.getElementsByTagName("table")
		let trList = tableList[5].getElementsByTagName("tr")



		let tdList = trList[9].getElementsByTagName("td")


		let sonGuncelleme = getOnlyValue(tdList[2].innerText)
		let ruzgar, ruzgarYonu, nemOrani, gorusMesafesi, basinc, hissedilenSicaklik, ciyNoktasi, ilName
		let iltdList = trList[4].getElementsByTagName("td")

		if (getTurkiye(getIl)) {

			ilName = getIlName(iltdList[0].getAttribute("title"), true)
			//türkiye 
			ruzgar = getOnlyValue(tdList[4].innerText)
			ruzgarYonu = getOnlyValue(tdList[6].innerText)
			nemOrani = getOnlyValue(tdList[8].innerText)
			gorusMesafesi = getOnlyValue(tdList[10].innerText)
			basinc = getOnlyValue(tdList[12].innerText)

		} else {
			ilName = getIlName(iltdList[0].getAttribute("title"), false)
			//abd
			hissedilenSicaklik = getOnlyValue(tdList[4].innerText)
			nemOrani = getOnlyValue(tdList[6].innerText)
			gorusMesafesi = getOnlyValue(tdList[8].innerText)
			basinc = getOnlyValue(tdList[10].innerText)
			ciyNoktasi = getOnlyValue(tdList[12].innerText)
		}
		let havaGunList: HavaGun[] = new Array()

		for (let i = 15; i < 120; i = i + 7) {

			let date = tdList[i].innerText
			let day = tdList[i + 1].innerText
			let aciklama = getAciklamalar(tdList[i + 3].innerText)
			let gunduzSic, geceSic

			if (isCelcius === "f") {
				gunduzSic = getFahrenheit(getOnlyValue(tdList[i + 4].innerText))
				geceSic = getFahrenheit(getOnlyValue(tdList[i + 5].innerText))
			} else {
				gunduzSic = getOnlyValue(tdList[i + 4].innerText)
				geceSic = getOnlyValue(tdList[i + 5].innerText)
			}

			let havaGun: HavaGun = new HavaGun(date, day, aciklama, gunduzSic, geceSic)
			havaGunList.push(havaGun)
		}

		let havaDurumu: HavaDurumu = new HavaDurumu(ilName, sonGuncelleme, ruzgar, ruzgarYonu,
			nemOrani, gorusMesafesi, basinc, havaGunList)

		response.writeHead(200, { "Content-Type": "application/json" });
		response.write(JSON.stringify(havaDurumu));
		response.end("");
	});
});

function getOnlyValue(value: string): string {
	let indexL = value.lastIndexOf(";")
	return value.substring(indexL + 1, value.length)
}

function getAciklamalar(value: string): string {
	let indexB = value.lastIndexOf("/>")
	let indexL = value.lastIndexOf("</")

	for (let index = 0; index < havaOlaylariList.length; index++) {

		if (havaOlaylariList[index].name === value.substring(indexB + 2, indexL)) {
			return index + ""
		}
	}
	return value.substring(indexB + 2, indexL)
}

function getIlName(value: string, isTurk: boolean): string {
	let indexB
	if (isTurk) {
		indexB = value.indexOf(" ")
		return value.substring(0, indexB)

	} else {
		indexB = value.lastIndexOf(" ")
		return value.substring(indexB + 1, value.length)

	}
}

function getFahrenheit(value: string): string {
	value = value.substring(0, value.indexOf("°C"))
	let fahrenheit = ((9 / 5) * parseInt(value) + 32).toFixed(2)
	return fahrenheit + "°F"
}

function getTurkiye(value: string): boolean {

	value = value.substring(value.indexOf("/") + 1, value.length)
	value = value.substring(0, value.indexOf("/"))

	if (value === "havadurumu") {
		return true
	} else {
		return false
	}
}

app.listen(port, () => {
	console.log(`server started at http://localhost:${port}`);
})