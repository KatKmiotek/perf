import http from 'k6/http';
import { check, sleep } from 'k6';



export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 10 },
    { duration: '20s', target: 0 },
  ],
};



// let accessToken = __ENV.GITHUB_TOKEN;
// console.log('github token is', accessToken);
const accessToken = __ENV.GITHUB_TOKEN

let query = `
{
      repository(name: "perf", owner: "KatKmiotek") {
        issue(number: 1) {
          comments(first: 10) {
            edges {
              node {
                bodyText
              }
            }
          }
        }
    }
  }`;

let headers = {
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
};


export default function () {
    let res = http.post('https://api.github.com/graphql', JSON.stringify({ query: query }), { headers: headers });
    let comments = JSON.parse(res.body).data.repository.issue.comments.edges;
    check(res, 
        {
        "status is 200": () => res.status === 200,
        "has correct comment 1": () => comments[0].node.bodyText === "lets see",
        "has correct comment 2": () => comments[1].node.bodyText === "another one",
        "has correct comment 3": () => comments[2].node.bodyText === "3rd one",
    });
}