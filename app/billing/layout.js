import "bootstrap/dist/css/bootstrap.min.css"
export const metadata = {
  title: 'Patient Billing',
  description: 'Here client is billed',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-primary text-white p-1 text-capitalize px-3">
          <h3>Prime Laboratory System</h3>
        </nav>
        <div>
          {children}
        </div>
      </body>
    </html>
  )
}
