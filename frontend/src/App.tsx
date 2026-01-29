import "./App.css";
import {Toaster} from 'sonner'
export default function App() {
  return (
    <>
    <Toaster richColors/>
    <div className="flex h-screen w-full items-center justify-center bg-blue-500">
      <h1 className="text-4xl font-bold text-white shadow-lg">
        CrownDine - Hello Team!
      </h1>
    </div>  
  </>
  )
}
