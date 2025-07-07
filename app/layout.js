import { Inter } from 'next/font/google';
import './globals.css'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Personal Finance Tracker',
  description: 'Track your income and expenses',
};

export default function RootLayout({
  children, //used to render anything passed inside the body of component tag
  //wraps page.js content implicitly
}) {
  return (
    <html lang="en">
       <body className={inter.className}>{children}</body>
    </html>
  );
}
     