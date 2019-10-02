import fs from "fs"
import iconv from "iconv-lite"
import MockAdapter from "axios-mock-adapter"

import m from "../"
import { client } from "../dump"
import dayjs from "dayjs"

const url = "https://hebi.5ch.net/test/read.cgi/news4vip/1570005180"

const html = fs.readFileSync(__dirname + "/mock/thread.html")
const mock = new MockAdapter(client)
client.defaults.transformResponse = [() => iconv.decode(html, "Shift_JIS")]

mock.onGet().reply(() => [200])

test("get thread", async () => {
  const thread = await m.getThread(url)
  expect(thread.title).toMatchInlineSnapshot(
    `"何でハリウッド映画に出てくる悪人って極悪な奴しかいないの？"`
  )

  expect(new Date()).toMatchInlineSnapshot(`2019-10-02T12:50:34.880Z`)
  expect(dayjs()).toMatchInlineSnapshot(`"2019-10-02T12:50:34.887Z"`)
  expect(dayjs().utcOffset()).toMatchInlineSnapshot(`540`)
  expect(+dayjs()).toMatchInlineSnapshot(`1570020634900`)
  expect(thread.postCount).toMatchInlineSnapshot(`20`)
  expect(thread.size).toMatchInlineSnapshot(`"4KB"`)
  expect(thread.url).toMatchInlineSnapshot(
    `"https://hebi.5ch.net/test/read.cgi/news4vip/1570005180"`
  )
  expect(thread.posts[0]).toMatchInlineSnapshot(`
    Object {
      "comma": 728,
      "message": "日本のアニメとか漫画に登場する敵たいに同情できるような過去を持っていたりとか重い事情があったりとかそういうのが微塵もないような外道しか出てこないじゃん。   敵に思い過去とかの設定付けたらダメなんか？",
      "name": "以下、5ちゃんねるからVIPがお送りします",
      "number": 1,
      "timestamp": 1570004640,
      "userId": "swYZ1cNv0",
    }
  `)
  expect(thread.posts[1]).toMatchInlineSnapshot(`
    Object {
      "comma": 924,
      "message": "見てる作品少なそう",
      "name": "以下、5ちゃんねるからVIPがお送りします",
      "number": 2,
      "timestamp": 1570004688,
      "userId": "/ycyjVeRd",
    }
  `)
})
