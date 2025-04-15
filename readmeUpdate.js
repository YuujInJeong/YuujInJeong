import { readFileSync, writeFileSync } from "node:fs";
import Parser from "rss-parser";
const readmePath = "README.md";
let readmeContent = readFileSync(readmePath, "utf8");
// 요청 헤더 설정
const parser = new Parser({
    headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        "Accept": "application/rss+xml, application/xml, text/xml",
    },
});
(async () => {
    try {
        // RSS 피드 가져오기
        const tistoryFeed = await parser.parseURL("https://realalpaca01.tistory.com/rss");
        const velogFeed = await parser.parseURL("https://v2.velog.io/rss/@yujin_jeong");
        // Tistory 블로그 포스트 생성
        let tistoryPosts = "### Tistory Latest Blog Posts\n\n";
        for (let i = 0; i < 5 && i < tistoryFeed.items.length; i++) {
            const { title, link } = tistoryFeed.items[i];
            tistoryPosts += `- [${title}](${link})\n`;
        }
        // Velog 블로그 포스트 생성
        let velogPosts = "\n### Velog Latest Blog Posts\n\n";  // 앞에 개행 추가
        for (let i = 0; i < 5 && i < velogFeed.items.length; i++) {
            const { title, link } = velogFeed.items[i];
            velogPosts += `- [${title}](${link})\n`;
        }
        
        // 기존 README에서 섹션을 교체하는 로직 수정
        let newReadmeContent = readmeContent;
        
        // 패턴 매칭 개선
        const tistoryPattern = /### Tistory Latest Blog Posts\n\n[\s\S]*?(?=\n### |$)/;
        const velogPattern = /### Velog Latest Blog Posts\n\n[\s\S]*?(?=\n### |$)/;
        
        if (readmeContent.includes("### Tistory Latest Blog Posts")) {
            newReadmeContent = newReadmeContent.replace(
                tistoryPattern,
                tistoryPosts
            );
        } else {
            newReadmeContent += `\n\n${tistoryPosts}`;
        }
        
        if (readmeContent.includes("### Velog Latest Blog Posts")) {
            newReadmeContent = newReadmeContent.replace(
                velogPattern,
                velogPosts.trim()
            );
        } else {
            newReadmeContent += `\n\n${velogPosts}`; // 두 개의 개행 추가
        }
        
        // 파일 쓰기 조건 확인
        if (newReadmeContent !== readmeContent) {
            console.log("README.md 변경 사항:\n", newReadmeContent);
            writeFileSync(readmePath, newReadmeContent, "utf8");
            console.log("README.md 업데이트 완료");
            process.exit(0); // 정상 종료
        } else {
            console.log("새로운 블로그 포스트가 없습니다.");
            process.exit(0); // 정상 종료
        }
    } catch (error) {
        console.error("RSS 피드 처리 중 오류 발생:", error.message);
        console.error(error.stack); // 에러 스택도 출력
        process.exit(1); // 오류 발생 시 실패 처리
    }
})();
