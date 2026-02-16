import Link from "next/link";
export default function Hero() {
  return (
    <section className="min-h-screen bg-black text-white flex items-center">
     {/*  <section className="min-h-screen bg-sky-600 text-white"> */}

      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">

        <div className="grid gap-12 md:grid-cols-2 items-center">
          
          {/* TEXTE */}
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl md:text-6xl font-bold text-sky-300">
              TalkMe
            </h1>

            <h2 className="text-3xl md:text-5xl leading-tight">
              Chat en temps réel.
              <br className="hidden md:block" />
              Sans limites.
            </h2>

            <p className="text-base md:text-lg text-gray-200">
              Crée des serveurs, discute avec tes amis et reste connecté en permanence.
            </p>

            <div className="mt-2 flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/login"
                className="text-center rounded border border-sky-300 px-6 py-3 text-sky-300 hover:bg-sky-300 hover:text-black transition"
              >
                Login
              </Link>

              <Link
                href="/auth/register"
                className="text-center rounded border border-sky-300 bg-sky-300 px-6 py-3 font-semibold text-black hover:bg-black hover:text-sky-300 transition"
              >
                Register
              </Link>
            </div>
          </div>

          {/* IMAGES*/}
          <div className="flex justify-center">
            <div className="flex items-center gap-6">
              
              <img
                className="hidden lg:block w-28"
                src="https://user-images.githubusercontent.com/54521023/116969935-c13d5b00-acd4-11eb-82b1-5ad2ff10fb76.png"
                alt="Astronaut left"
              />


              <img
                className="w-56 sm:w-72 md:w-80"
                src="https://user-images.githubusercontent.com/54521023/116969931-bedb0100-acd4-11eb-99a9-ff5e0ee9f31f.png"
                alt="Rocket center"
              />


              <img
                className="hidden lg:block w-28"
                src="https://user-images.githubusercontent.com/54521023/116969939-c1d5f180-acd4-11eb-8ad4-9ab9143bdb50.png"
                alt="Astronaut right"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

