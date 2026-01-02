export const metadata = {
  title: 'Follow the Sun',
  description: 'Track your outdoor adventures in 2026',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
