const { promises: fs } = require('fs')
const path = require('path')
const RSS = require('rss')
const matter = require('gray-matter')

async function generate() {
  const feed = new RSS({
    title: 'Nicholas DiPreta',
    site_url: 'https://nicholasdipreta.com',
    feed_url: 'https://nicholasdipreta/feed.xml'
  })

  const blogs = await fs.readdir(path.join(__dirname, '..', 'pages', 'blog'))
  const allBlogs = []
  await Promise.all(
    blogs.map(async (name) => {
      if (name.startsWith('index.')) return

      const content = await fs.readFile(
        path.join(__dirname, '..', 'pages', 'blog', name)
      )
      const frontmatter = matter(content)

      allBlogs.push({
        title: frontmatter.data.title,
        url: '/blog/' + name.replace(/\.mdx?/, ''),
        date: frontmatter.data.date,
        description: frontmatter.data.description,
        categories: frontmatter.data.tag.split(', '),
        author: frontmatter.data.author
      })
    })
  )

  allBlogs.sort((a, b) => new Date(b.date) - new Date(a.date))
  allBlogs.forEach((post) => {
      feed.item(post)
  })
  await fs.writeFile('./public/feed.xml', feed.xml({ indent: true }))
}

generate()
