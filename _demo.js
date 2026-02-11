import { LaftelClient } from "./client.ts";
const client = new LaftelClient();
//client.setUserAgent();
console.log(await client.autoComplete("귀멸의")); // String[]
console.log(await client.search("귀멸의")); // Anime[]

const anime = await client.getAnime(44232);
console.log(anime); // "어차피, 사랑하고 만다. 2기"

const { items, total } = await client.getEpisodes(44232);
console.log(`Found ${total} episodes`);

console.log(await client.getEpisode(89947));

/*
await client.login("hello@example.net", "password"); // client.setToken("abcdef123");

let comment = await client.addComment(episodeId, "재밌음");
await client.editComment(comment?.id, "사실 아직 안봄");

let review = await client.addReview(animeId, "아직 안 봤는데 흥미롭네요.", 4);
await client.deleteReview(review.id);
*/
