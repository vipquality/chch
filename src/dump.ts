import cheerio from "cheerio"
import { Iconv } from "iconv"
import axios from "axios"
import dayjs from "dayjs"

const host = "http://hebi.5ch.net"
const makeThreadUrl = id => `${host}/test/read.cgi/news4vip/${id}`
const listPageUrl = `${host}/news4vip/subback.html`

const sjis2utf8 = new Iconv("SHIFT_JIS", "UTF-8//TRANSLIT//IGNORE")

axios.defaults.responseType = "arraybuffer"
axios.defaults.transformResponse = [data => sjis2utf8.convert(data).toString()]

function titleParse(text: string): { title: string; count: number } | null {
  const m = text.match(/^\d+: ([\s\S]*?) \((\d+)\)$/)
  if (!m || !m[1]) {
    return null
  }

  return { title: m[1], count: Number(m[2]) }
}
type ThreadMin = { id: string; title: string; url: string; count: number }

export async function getThreads() {
  const res = await axios.get(listPageUrl)
  const $ = cheerio.load(res.data)
  const threads: ThreadMin[] = []
  $("#trad > a").map((i, elA) => {
    const a = $(elA)
    const res = titleParse(a.text())
    if (!res || !res.title) {
      return
    }
    const { title, count } = res
    const href = a.attr("href")
    const id = href.split("/")[0]
    const url = makeThreadUrl(id)
    threads.push({ id, title, url, count })
  })
  return { threads }
}

export type Post = {
  number: number
  name: string
  userId: string
  timestamp: number
  comma: number
  message: string
}

export type Thread = {
  title: string
  url: string
  postCount: number
  size: string
  posts: Post[]
}

export async function getThread(url: string): Promise<Thread> {
  const $ = cheerio.load((await axios.get(url)).data)

  const title = $(".title")
    .text()
    .trim()
  const postCount = parseInt($(".pagestats .menujust .metastats")[0].innerText)
  const size = $(".pagestats .menujust .metastats")[1].innerText

  const posts: Post[] = []
  $(".post").map((i, elA) => {
    const div = $(elA)
    const number = div.find(".number").text()
    const name = div.find(".name").text()
    const userId = div
      .find(".uid")
      .text()
      .split(":")[1]
    const dateStr = div.find(".date").text()
    const timestamp = +dayjs(dateStr)
    const comma = Number(dateStr.split(".")[1])
    const message = div
      .find(".message")
      .text()
      .trim()
    posts.push({
      number,
      name,
      userId,
      timestamp,
      comma,
      message,
    })
  })
  return {
    title,
    url,
    postCount,
    size,
    posts,
  }
}
