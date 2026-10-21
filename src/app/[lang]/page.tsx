type Props = {
  params: Promise<{ lang: string }>
}

export default async function Page({ params }: Props) {
  const { lang } = await params

  return (
    <main>
      <h1>Immanuel Mruk</h1>
      <p>lang={lang}</p>
    </main>
  )
}
