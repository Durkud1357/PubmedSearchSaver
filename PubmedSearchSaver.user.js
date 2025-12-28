// ==UserScript==
// @name         PubMedSearchSaver
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Script that enhances PubMed browsing experience by highlighting articles from previous saved searches. Wesołych Świąt!
// @author       Durkud1357
// @match        https://*.han3.wum.edu.pl/*
// @match        https://pubmed.ncbi.nlm.nih.gov/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    const h = location.hostname;
    if (!h.startsWith("pubmed")) {
        return;
    }

    console.log(GM_getValue("seenIDs"));
    console.log("a");

    createSaveButton();
    selectSeen();


    function storeSearch() {
        let params = new URLSearchParams(document.location.search);
        let r = params.get("term");

        GM_xmlhttpRequest({
            method: "GET",
            url: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${r}&retmode=json&retmax=200000`,
            onload: r => {
                const data = JSON.parse(r.responseText);

                const IDs = GM_getValue("seenIDs", []);

                if (Array.isArray(IDs)) {
                    IDs.push(...data.esearchresult.idlist);

                    GM_setValue("seenIDs", IDs);
                    console.log("stored");
                    showToast("SAVED");
                } else {
                    GM_setValue("seenIDs", data.esearchresult.idlist);
                    console.log("stored");
                    showToast("SAVED");
                }
            }
        });
    }

    function createSaveButton() {
        const searchCont = document.querySelector(".search-links");
        // SAVE BUTTON
        const saveBtn = document.createElement("a");
        saveBtn.href = "#";
        saveBtn.className = "search-input-link";

        const spanS = document.createElement("span");
        spanS.textContent = "SAVE SEARCH RESULTS❤️";

        saveBtn.appendChild(spanS);

        searchCont.appendChild(saveBtn);

        saveBtn.addEventListener("click", e => {
            e.preventDefault();
            storeSearch();
        });

        // CLEAR BUTTON
        const clearBtn = document.createElement("a");
        clearBtn.href = "#";
        clearBtn.className = "search-input-link";

        const spanC = document.createElement("span");
        spanC.textContent = "DELETE SAVED";

        clearBtn.appendChild(spanC);

        searchCont.appendChild(clearBtn);

        clearBtn.addEventListener("click", e => {
            e.preventDefault();
            GM_setValue("seenIDs", []);
            console.log("DELETED");
            showToast("DELETED");
        });
    }

    function selectSeen() {
        const a = document.querySelectorAll(".docsum-title");
        for (const el of a) {

            const s = el.href.replace(/\/$/, "").split("/").pop();
            console.log(s);

            if (!Array.isArray(GM_getValue("seenIDs"))) {
                return;
            }

            if (GM_getValue("seenIDs").includes(s)) {
                console.log("hit");
                el.parentElement.style.backgroundColor = "#b58fd9";
            }
        }
    }

    function showToast(msg, timeout = 1500) {
        const div = document.createElement("div");
        div.textContent = msg;

        Object.assign(div.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#323232",
            color: "white",
            padding: "12px 16px",
            borderRadius: "6px",
            zIndex: 99999,
            fontSize: "18px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        });

        document.body.appendChild(div);

        setTimeout(() => div.remove(), timeout);
    }
})();