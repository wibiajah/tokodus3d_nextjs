'use client'
import { preload } from 'swr'
import { fetcher } from "@/lib/swr"

// ─────────────────────────────────────────────────────────────
//  SWR Preloader — prefetch data statis dari Laravel
//  supaya UI tidak loading saat pertama kali render
// ─────────────────────────────────────────────────────────────
const L = process.env.NEXT_PUBLIC_LARAVEL_URL

preload(`${L}/api/3d/MinOrderConfig`,  fetcher)
preload(`${L}/api/3d/TaliOptions`,     fetcher)
preload(`${L}/api/3d/LaminasiOptions`, fetcher)
preload(`${L}/api/3d/SablonOptions`,   fetcher)
preload(`${L}/api/3d/PrintingOptions`, fetcher)
preload(`${L}/api/3d/Flutes`,          fetcher)
preload(`${L}/api/3d/BoxModels`,       fetcher)

export default function SWRPreloader() {
  return null
}