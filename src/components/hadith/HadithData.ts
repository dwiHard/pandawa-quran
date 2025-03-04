
import { HadithSource } from "@/types/hadith";

export const hadithSources: HadithSource[] = [
  { id: "arbain", name: "Arbain Nawawi", range: 42, endpoint: "arbain", hasRandomEndpoint: true },
  { id: "bukhari", name: "Bukhari", range: 6638, endpoint: "bukhari", hasRandomEndpoint: false },
  { id: "muslim", name: "Muslim", range: 4930, endpoint: "muslim", hasRandomEndpoint: false },
  { id: "abu-dawud", name: "Abu Dawud", range: 4419, endpoint: "abu-dawud", hasRandomEndpoint: false },
  { id: "tirmidzi", name: "Tirmidzi", range: 3625, endpoint: "tirmidzi", hasRandomEndpoint: false },
  { id: "nasai", name: "Nasai", range: 5364, endpoint: "nasai", hasRandomEndpoint: false },
  { id: "ibnu-majah", name: "Ibnu Majah", range: 4285, endpoint: "ibnu-majah", hasRandomEndpoint: false },
  { id: "ahmad", name: "Ahmad", range: 4305, endpoint: "ahmad", hasRandomEndpoint: false },
  { id: "malik", name: "Malik", range: 1587, endpoint: "malik", hasRandomEndpoint: false },
  { id: "darimi", name: "Darimi", range: 2949, endpoint: "darimi", hasRandomEndpoint: false },
  { id: "bm", name: "Bulughul Maram", range: 1697, endpoint: "bm", hasRandomEndpoint: true },
];
