
import { HadithDetail, HadithInfo, HadithSource } from "@/types/hadith";

export const fetchHadith = async ({ collection, number }: { collection: string, number: number }) => {
  const response = await fetch(`https://api.myquran.com/v2/hadits/${collection}/${number}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch hadith number ${number} from ${collection}`);
  }
  const data = await response.json();
  return data.data as HadithDetail;
};

// Fetch random hadith with manual randomization for collections without random endpoint
export const fetchRandomHadith = async (source: HadithSource) => {
  if (source.hasRandomEndpoint) {
    // Use API's random endpoint for collections that support it
    const response = await fetch(`https://api.myquran.com/v2/hadits/${source.endpoint}/acak`);
    if (!response.ok) {
      throw new Error(`Failed to fetch random hadith from ${source.name}`);
    }
    const data = await response.json();
    return data.data as HadithDetail;
  } else {
    // Manual randomization for collections without random endpoint
    const randomNumber = Math.floor(Math.random() * source.range) + 1;
    return fetchHadith({ collection: source.endpoint, number: randomNumber });
  }
};

// Fetch hadiths based on collection source and its full range
export const fetchHadithsInfoBySource = async (source: HadithSource) => {
  const hadithTitles: Record<string, string[]> = {
    "arbain": [
      "Niat", "Islam, Iman dan Ihsan", "Rukun Islam", "Penciptaan Manusia", 
      "Perkara Baru dalam Agama", "Halal dan Haram", "Agama adalah Nasihat", 
      "Perintah Memerangi Manusia", "Perintah dan Larangan", "Makanan yang Baik",
      "Yakin dan Meninggalkan Keraguan", "Meninggalkan yang Tidak Bermanfaat", 
      "Mencintai Sesama Muslim", "Larangan Menumpahkan Darah", "Berkata Baik", 
      "Larangan Marah", "Berbuat Baik dalam Segala Hal", "Takwa kepada Allah", 
      "Pertolongan Allah", "Malu", "Istiqamah", "Jalan Menuju Surga", 
      "Bersuci dan Shalat", "Larangan Berbuat Zalim", "Sedekah", 
      "Mendamaikan Manusia", "Kebajikan dan Dosa", "Nasihat", 
      "Amal yang Mendekatkan ke Surga", "Batas-batas Allah", "Zuhud", 
      "Larangan Menimbulkan Bahaya", "Pembuktian dan Sumpah", 
      "Mengubah Kemungkaran", "Persaudaraan", "Amalan yang Bermanfaat", 
      "Berbuat Baik", "Catatan Kebaikan dan Keburukan", "Wali Allah", 
      "Toleransi Agama", "Dunia adalah Ladang Akhirat", "Mengikuti Sunnah"
    ]
  };
  
  const promises = [];
  // Use the full range of hadiths for each collection, not limited to 20
  const fetchCount = source.range <= 100 ? source.range : 100; // Limit to 100 for very large collections
  
  for (let i = 1; i <= fetchCount; i++) {
    const title = source.id === "arbain" && i <= hadithTitles.arbain.length 
      ? hadithTitles.arbain[i-1] 
      : `Hadith ${i}`;
      
    promises.push(
      fetch(`https://api.myquran.com/v2/hadits/${source.endpoint}/${i}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch hadith ${i} from ${source.name}`);
          return res.json();
        })
        .then(data => ({
          id: i,
          name: `${source.name} No. ${i}`,
          title: title,
          text: data.data?.contents?.text || data.data?.indo || "",
          source: source.id
        }))
        .catch(err => {
          console.error(`Error fetching hadith ${i} from ${source.name}:`, err);
          return {
            id: i,
            name: `${source.name} No. ${i}`,
            title: title,
            text: "",
            source: source.id
          };
        })
    );
  }
  
  const results = await Promise.all(promises);
  return results as HadithInfo[];
};
