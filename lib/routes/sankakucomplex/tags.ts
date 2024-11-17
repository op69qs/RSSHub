import dayjs from 'dayjs';
import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';

// const idolCookie = config.sankakucomplex.idolCookie;
// const chanCookie = config.sankakucomplex.chanCookie;
//

export const route: Route = {
    path: '/tags/:type/:tags?',
    categories: ['picture'],
    example: '/sankakucomplex/idol/tags',
    parameters: {
        type: 'idol or chan',
        tags: '标签，多个标签使用 `%20` 连接',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['idol.sankakucomplex.com', 'sankakucomplex.com/'],
        },
    ],
    name: 'sankakucomplex',
    maintainers: ['test'],
    handler,
    url: 'idol.sankakucomplex.com',
};

async function handler(ctx) {
    // const tags = ctx.req.param('tags');
    // const type = ctx.req.param('type');
    const currentDate = dayjs().format('YYYY-MM-DD');

    const defaultTag = `date%3A${currentDate}%20`;
    const { type = 'idol', tags } = ctx.req.param();

    const finalTags = tags ? `${defaultTag}${tags}` : defaultTag;
    const rootUrl = `https://${type}.sankakucomplex.com`;
    const currentUrl = `${rootUrl}/?tags=${finalTags}`;
    // https://idol.sankakucomplex.com/?tags=asian%20order%3Apopular
    const response = await got({
        headers: {
            cookie: config.sankakucomplex[`${type}Cookie`],
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            Host: 'idol.sankakucomplex.com',
            Pragma: 'no-cache',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
        },

        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    // let items = $('.post-preview-container a.post-preview-link')
    //     .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 30)
    //     .toArray()
    //     .map((item) => {
    //         item = $(item);
    //
    //         return {
    //             title: item.find('.lead').text(),
    //             link: `${rootUrl}${item.attr('href').split('?')[0]}`,
    //             pubDate: parseDate(item.find('.date').text()),
    //         };
    //     });text
    const items = $('div.post-preview-container a.post-preview-link')
        .toArray()
        .map((item) => {
            item = $(item);
            const itemLink = item.attr('href');
            const img = item.find('img').first();
            const descStr = img.attr('data-auto_page');
            const imgSrc = img.attr('src');

            // const imgResponse = await got({
            //     method: 'get',
            //     url: itemLink,
            // });
            // const $$ = load(imgResponse.data);
            // $('#stats a').first().attr('title')

            return {
                title: descStr,
                link: itemLink,
                // pubDate: parseDate(item.find('relative-time').attr('datetime')),
                pubDate: Date.now(),
                description: `<a href="${itemLink}"><img  src="${imgSrc}"  alt="${descStr}"  title="${descStr}" /></a>`,
            };
        });

    // items = await Promise.all(
    //     items.map((item) =>
    //         cache.tryGet(item.link, async () => {
    //             const detailResponse = await got({
    //                 method: 'get',
    //                 url: item.link,
    //             });
    //
    //             const content = load(detailResponse.data);
    //
    //             item.description = content('.article').html();
    //
    //             return item;
    //         })
    //     )
    // );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
