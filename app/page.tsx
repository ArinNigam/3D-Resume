import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TopMenu } from '../components/TopMenu';
import { Footer } from '../components/Footer';
import { BorderBeam } from '@/components/ui/BorderBeam';
import { BlurFade } from '@/components/ui/BlurFade';
export default async function Home() {
 
  return (
    <>
      <TopMenu />

      <section className="flex-1 flex flex-col min-h-screen">
        <div className="flex flex-col min-h-[80vh]">
          {/* Main content */}
          <div className="flex-1 flex flex-col md:flex-row max-w-4xl mx-auto items-center px-5 md:px-2 py-8 md:pt-0">
            {/* Left side - Call to action */}
            <div className="w-full md:w-1/2 max-w-[378px] flex flex-col justify-center items-center md:items-start ">
              <div className="max-w-md text-center md:text-left">
                <div className="inline-block font-mono gap-2.5 px-3 py-1.5 rounded bg-[#ffb86b]/20 text-sm mb-5 text-[#ffb86b] shadow-[0_0_10px_2px_#ffb86b] animate-pulse">
                  Inspired by GTA 6
                </div>
                <h1
                  className="text-[38px] font-extrabold mb-4 flex items-center justify-center md:justify-start gap-4 flex-wrap font-mono leading-tight text-white drop-shadow-[0_0_16px_#ff6e48]"
                  style={{ fontFamily: '"Orbitron", "Montserrat", monospace' }}
                >
                  <span className="text-white">Resume</span>
                  <span className="text-[#ffb86b]">→</span>
                    <img
                    src="/logo.png"
                    alt="GTA VI Logo"
                    className="h-24 w-auto"
                    />
                  <br />
                  <span className="text-white">
                    <span className="hidden sm:inline text-white font-bold">in one click</span>
                  </span>
                </h1>
                <p className="text-base mb-8 font-mono text-center md:text-left text-[#fffbe9] drop-shadow-[0_0_8px_#ffb86b] leading-relaxed">
                  Turn your resume/portfolio<br />into a GTA 6 website.
                </p>
                <div className="relative flex flex-col items-center font-mono w-full md:w-fit">
                  <Link href="/upload">
                    <Button className="relative group flex items-center bg-[#ff6eec] hover:bg-[#ffb86b] text-[#2d1a4a] px-6 py-3 h-auto text-base border-2 border-[#ffb86b] rounded-lg transition-all duration-200 shadow-[0_0_20px_4px_#ff6eec] hover:shadow-[0_0_24px_8px_#ffb86b] font-extrabold tracking-widest">
                      <img
                        src="/sparkle.png"
                        alt="Sparkle Icon"
                        className="h-5 w-5 mr-2 relative drop-shadow-[0_0_8px_#ffb86b]"
                      />
                      <span className="relative">Upload Resume</span>
                    </Button>
                  </Link>
                  <p className="text-sm text-[#fffbe9] my-4 text-center drop-shadow-[0_0_8px_#ffb86b] ">
                    Takes 1 minute!
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Preview */}
            <div className="w-full md:w-1/2 flex justify-center items-center flex-1 relative max-h-[700px] min-w-[50%] lg:min-w-[500px]">
              <div className="absolute inset-0 -bottom-4 rounded-3xl bg-[#ffb86b]/10 blur-xl h-full border-2 border-[#ff6eec]"></div>
              <BlurFade delay={0.25} inView>
                <img
                  src="/gta6.jpg"
                  className="relative w-full max-w-[500px] h-full object-cover overflow-hidden rounded-3xl border-4 border-[#ff6eec] shadow-[0_0_32px_8px_#ffb86b]"
                  alt="GTA 6 Street Scene Preview"
                />
              </BlurFade>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
