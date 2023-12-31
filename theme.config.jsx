const YEAR = new Date().getFullYear()

export default {
  footer: (
    <small style={{ display: 'block', marginTop: '8rem' }}>
      <time>{YEAR}</time> © Nicholas DiPreta.
      <a href="/feed.xml">RSS</a>
      <style jsx>{`
        a {
          float: right;
          color: white;
        }
        @media screen and (max-width: 480px) {
          article {
            color: white;
            padding-top: 2rem;
            padding-bottom: 4rem;
          }
        }
      `}</style>
    </small>
  )
}
