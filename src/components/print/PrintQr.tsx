import QRCode from 'qrcode'

type Props = {
  url: string
}

export async function PrintQr({ url }: Props) {
  const svg = await QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    width: 88,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })

  return (
    <div
      className="print-qr"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
