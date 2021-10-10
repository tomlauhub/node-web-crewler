const express = require("express");
const app = express();
const cheerio = require("cheerio");
const axios = require("axios");
const fethHtml = async (url) => {
    try {
        const { data } = await axios.get(url);
        return data;
    } catch {
        console.error(`ERROR`);
    }
};
extra = false; 


/** get detail */
const insideWebstie = async (url) => {
     try {
        const { data } =  await axios.get(url)
        const result = [];
        const $ = cheerio.load(data);
        $("body")
            .find(
                "div[class='col-xs-8 border-1'] > div[class='news-detail'] > div[class='news-content']"
            )
            .each(function (el, value) {
              
            result.push({
                contact: $(value).text().trim().replace(/\n                /g, ""),
                cover_image: $(value).find('img').attr('src')
            });

            });
            return result;
     } catch { 
        console.error(`ERROR inside`);
     }
}


//  router
app.get("/news", async function (req, res) {
    let extra = false;
    if (req.query.extra == 'ok'){
        extra =  true;
    }
    const steamUrl = "https://www.gameapps.hk/";

    const html = await fethHtml(steamUrl);
    const $ = cheerio.load(html);
   
    /** 綜合新聞 */
    const gamenewsArray = [];
    const gamenews =  $("body")
        .find(
        "div[class='col-xs-8'] > div[class='news-list border-1'] > div[class='media news-big-icon']"
        )

    for(const data of gamenews){
        if (extra) {
            for ($a = 0; $a < 1; $a++){
                extraContent = await insideWebstie("https://www.gameapps.hk" +$(data).find('a').attr('href'));
            }
            gamenewsArray.push({
                title: $(data).find('h3').text().trim(),
                description: $(data).find("div[class='news-list-intro']").text().trim(),
                cover_image: $(data).find('img').attr('src'),
                url: "https://www.gameapps.hk" +$(data).find('a').attr('href'),
                bonus : extraContent
            });
        } else {
            gamenewsArray.push({
                title: $(data).find('h3').text().trim(),
                description: $(data).find("div[class='news-list-intro']").text().trim(),
                cover_image: $(data).find('img').attr('src'),
                url: "https://www.gameapps.hk" +$(data).find('a').attr('href'),
            });
        }
    }

/** slider   */
    sliderArray = [];
    const sliders  = $("body")
    .find(
    "div[class='slider'] > div[class='carousel slide'] > div[class='carousel-inner'] > div"
    );
    for(const data of sliders){
        let urlLink = $(data).find('a').attr('href');
        if (!$(data).find('a').attr('href').includes("https://") && !$(data).find('a').attr('href').includes("http://")   ){
            urlLink  = "https://www.gameapps.hk" +$(data).find('a').attr('href');
        }
        
        if (extra) {
            if (!$(data).find('a').attr('href').includes("https://") && !$(data).find('a').attr('href').includes("http://")   ){
                extraContent = await insideWebstie("https://www.gameapps.hk" +$(data).find('a').attr('href'));
            } else {
                extraContent = [];
            }
            sliderArray.push({
                title: $(data).find('a').text().trim(),
                cover_image: $(data).find('img').attr('src'),
                url: urlLink,
                bonus : extraContent
            });
        } else {
            sliderArray.push({
                title: $(data).find('a').text().trim(),
                cover_image: $(data).find('img').attr('src'),
                url: urlLink,
            });
        }
    }


/* 人氣新聞  */
    popnewsArray = [];
    const popnews =  $("body")
        .find(
        "ul[class='hot-news'] > li"
        )
    for(const data of popnews){
        if (extra) {
            for ($a = 0; $a < 1; $a++){
                extraContent = await insideWebstie("https://www.gameapps.hk" +$(data).find('a').attr('href'));
            }
            popnewsArray.push({
                title: $(data).find('h3').text().trim(),
                cover_image: $(data).find('img').attr('src'),
                url: "https://www.gameapps.hk" +$(data).find('a').attr('href'),
                bonus : extraContent
            });
        } else {
            popnewsArray.push({
                title: $(data).find('h3').text().trim(),
                cover_image: $(data).find('img').attr('src'),
                url: "https://www.gameapps.hk" +$(data).find('a').attr('href'),
            });
        }
    }

/*  preorderArray = 事前登錄;
    poporderArray = 最新人氣下載;
    freeIOSArray = 免費iOS 手遊Top 10 [日本];
    popIOSArray =  暢銷 iOS 手遊Top 10 [日本];  */
    preorderArray = [];
    poporderArray = [];
    freeIOSArray = [];
    popIOSArray = [];
    const sidebars =  $("body")
        .find(
            "div[class='col-xs-4 side'] > div[class='panel panel-default']"
        )

    for(const data of sidebars){
        $extra = '';
        switch ($(data).find("h2").text().trim()) {
            case "事前登錄" :
                $(data).find("div[class='panel-body no-padding'] > a").each(function (el, content){
                    preorderArray.push({
                        title: $(content).find('h3').text().trim(),
                        cover_image: $(content).find('div[class="media news-small-icon"] > div[class="media-left"] > img').attr('src'),
                        url: "https://www.gameapps.hk" +$(content).attr('href'),
                    });
                })
            break;
            case "最新人氣下載" :
                $(data).find("div[class='panel-body no-padding'] > a").each(function (el, content){
                    poporderArray.push({
                        title: $(content).find('h3').text().trim(),
                        cover_image: $(content).find('div[class="media news-small-icon"] > div[class="media-left"] > img').attr('src'),
                        url: "https://www.gameapps.hk" +$(content).attr('href'),
                    });
                })
            break;
            case "iOS 手遊Top 10 [日本]" :
                $('#freeApps').find('a').each(function (el, content){
                    freeIOSArray.push({
                        title: $(content).find('div[class="top-app-name"]').text().trim(),
                        //description: $(data).find("div[class='news-list-intro']").text().trim(),
                        cover_image: $(content).find('div[class="media-left"] > img').attr('src'),
                        url: $(content).attr('href'),
                        rank: $(content).find('div[class="rank-no"]').text().trim(),
                        //bonus : extra
                    });
                })
                $('#paidApps').find('a').each(function (el, content){
                    popIOSArray.push({
                        title: $(content).find('div[class="top-app-name"]').text().trim(),
                        //description: $(data).find("div[class='news-list-intro']").text().trim(),
                        cover_image: $(content).find('div[class="media-left"] > img').attr('src'),
                        url: $(content).attr('href'),
                        rank: $(content).find('div[class="rank-no"]').text().trim(),
                        //bonus : extra
                    });
                })
            break;
           

        }
      
        
    }
    results = {
        slider: sliderArray ? sliderArray : [],
        gamesnews : gamenewsArray ? gamenewsArray : [],
        popnews : popnewsArray ? popnewsArray : [],
        preorder : preorderArray ? preorderArray : [],
        poporder : poporderArray ? poporderArray : [],
        freeIOS : freeIOSArray ? freeIOSArray : [],
        popIOS : popIOSArray ? popIOSArray : []
    };
    res.status(200).send({ data: results });
});




app.listen(3000, function () {
  console.log("server listening on 3000");
});