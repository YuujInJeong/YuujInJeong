import { readFileSync, writeFileSync } from "node:fs";
import Parser from "rss-parser";

const readmePath = "README.md";
let readmeContent = readFileSync(readmePath, "utf8");
const parser = new Parser();

(async () => {
    // RSS 피드 가져오기
    const tistoryFeed = await parser.parseURL("https://realalpaca01.tistory.com/rss");
    const velogFeed = await parser.parseURL("https://v2.velog.io/rss/@yujin_jeong");

    // 최신 블로그 포스트 생성
    let tistoryPosts = "### Tistory Latest Blog Posts\n\n";
    for (let i = 0; i < 5 && i < tistoryFeed.items.length; i++) {
        const { title, link } = tistoryFeed.items[i];
        tistoryPosts += `- [${title}](${link})\n`;
    }

    let velogPosts = "### Velog Latest Blog Posts\n\n";
    for (let i = 0; i < 5 && i < velogFeed.items.length; i++) {
        const { title, link } = velogFeed.items[i];
        velogPosts += `- [${title}](${link})\n`;
    }

    const combinedPosts = `${tistoryPosts}\n${velogPosts}`;

    // README.md 업데이트 여부 확인
    const newReadmeContent = readmeContent.includes("### Tistory Latest Blog Posts")
        ? readmeContent.replace(
              /### Tistory Latest Blog Posts[\s\S]*?(?=### Velog Latest Blog Posts|$)/,
              combinedPosts
          )
        : readmeContent + "\n" + combinedPosts;

    if (newReadmeContent !== readmeContent) {
        writeFileSync(readmePath, newReadmeContent, "utf8");
        console.log("README.md 업데이트 완료");
        process.exit(0); // 정상적으로 종료 (업데이트 있음)
    } else {
        console.log("새로운 블로그 포스트가 없습니다.");
        process.exit(1); // 업데이트 없음
    }
})();
