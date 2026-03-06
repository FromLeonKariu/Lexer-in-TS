import { readFile } from "node:fs/promises";

type int = number;

interface Token {
  content: string;
  cursor: int;
  line: int;
  type: TokenType;
}

// 1. Replace 'const enum' with a standard const object
const TokenType = {
  LEFT_CURL: "LEFT_CURL",
  RIGHT_CURL: "RIGHT_CURL",
  LEFT_PAREN: "LEFT_PAREN",
  RIGHT_PAREN: "RIGHT_PAREN",
  PIPE: "PIPE",
  SEMICOLON: "SEMICOLON",
  COLON: "COLON",
  HASH: "HASH",
  COMMA: "COMMA",
  PERIOD: "PERIOD",
  EMAILSYMBOL: "EMAIL_SYMBOL",
  ANDSYMBOL: "AND_SYMBOL",
  PLUS: "PLUS",
  EQUAL_SIGN: "EQUAL_SIGN",
  MINUS: "MINUS",
  BACK_SLASH: "BACK_SLASH",
  FORWARD_SLASH: "FORWARD_SLASH",
  MULTIPLY: "MULTIPLY",
  SINGLE_QUOTES: "SINGLE_QUOTES",
  DOUBLE_QUOTES: "DOUBLE_QUOTES",
  IDENTIFIER: "IDENTIFIER",
  KEYWORD: "KEYWORD",
  NUMBER: "NUMBER",
  RIGHT_SQUARE_BRACKET: "RIGHT_SQUARE_BRAKET",
  LEFT_SQUARE_BRACKET: "LEFT_SQUARE_BRACKET",
  UNKNOWN: "UNKNOWN",
} as const;

const keywords = new Set<string>([
  "if",
  "let",
  "while",
  "return",
  "enum",
  "function",
  "for",
  "continue",
  "else",
  "const",
]);
const delimiters = new Set<string>([
  ":",
  ";",
  "|",
  '"',
  "(",
  ")",
  "{",
  "}",
  ".",
  ",",
  "#",
  "%",
  "&",
  "[",
  "\\",
  "]",
  "@",
]);

const operator = new Set<string>(["'", "+", "-", "/", "*", "="]);

let tokenArray: Array<Token> = [];

// 2. Create a type alias from the object's values
type TokenType = (typeof TokenType)[keyof typeof TokenType];

function tokinizer(file: string) {
  let cursor = 0;
  let line = 0;
  let collector: string = "";

  let whitespaces = 0;

  for (let i = 0; i < file.length; i++) {
    const char = file[i];

    if (char === "\n") {
      create_new_token(collector, cursor, line);
      collector = "";
      line++;
      cursor = 0;
      continue;
    }

    if (char === " ") {
      create_new_token(collector, cursor, line);
      collector = "";
      cursor++;
      continue;
    }

    if (delimiters.has(char) || operator.has(char)) {
      create_new_token(collector, cursor, line);
      collector = "";
      create_new_token(char, cursor, line);
      cursor++;
      continue;
    }

    if (i === file.length - 1) {
      collector += char;
      create_new_token(collector, cursor, line);
      collector = "";
      continue;
    }

    collector += char;
    cursor++;
  }
}

function check_type(lexeme: string): TokenType {
  let type: TokenType;

  if (delimiters.has(lexeme) || operator.has(lexeme)) {
    switch (lexeme) {
      case "{":
        return (type = TokenType.LEFT_CURL);
      case "}":
        return (type = TokenType.RIGHT_CURL);
      case "(":
        return (type = TokenType.LEFT_PAREN);
      case ")":
        return (type = TokenType.RIGHT_PAREN);
      case ";":
        return (type = TokenType.SEMICOLON);
      case '"':
        return (type = TokenType.DOUBLE_QUOTES);
      case "'":
        return (type = TokenType.SINGLE_QUOTES);
      case ":":
        return (type = TokenType.COLON);
      case "#":
        return (type = TokenType.HASH);
      case ".":
        return (type = TokenType.PERIOD);
      case ",":
        return (type = TokenType.COMMA);
      case "+":
        return (type = TokenType.PLUS);
      case "[":
        return (type = TokenType.LEFT_SQUARE_BRACKET);
      case "]":
        return (type = TokenType.RIGHT_SQUARE_BRACKET);
      case "-":
        return (type = TokenType.MINUS);
      case "=":
        return (type = TokenType.EQUAL_SIGN);
      case "\\":
        return (type = TokenType.BACK_SLASH);
      case "/":
        return (type = TokenType.FORWARD_SLASH);
      case "*":
        return (type = TokenType.MULTIPLY);
      default:
        return (type = TokenType.UNKNOWN);
    }
  }

  if (keywords.has(lexeme) == true) {
    return (type = TokenType.KEYWORD);
  } else if (isnum(lexeme)) {
    return (type = TokenType.NUMBER);
  } else if (isalnum(lexeme) && !is_first_char_num(lexeme)) {
    return (type = TokenType.IDENTIFIER);
  } else return (type = TokenType.UNKNOWN);
}

function create_new_token(lexeme: string, cursor: int, line: int) {
  if (lexeme.length === 0) return;
  const type = check_type(lexeme);
  tokenArray.push({ content: lexeme, cursor, line, type });
}

function isalnum(content: string): boolean {
  const regex = /^[a-zA-Z0-9_]+$/;
  if (content == null) {
    // console.log("content is null");
    return false;
  }
  if (regex.test(content) == true) {
    // console.log("True");
    return true;
  }
  //   console.log("regex check on content is false");
  return false;
}
function isnum(content: string) {
  const onlyNums = /^[0-9]+$/;

  if (content === null) {
    // console.log("empty string provided");
    return;
  }

  if (onlyNums.test(content) == true) {
    // console.log("first char is num");
    return true;
  }
  //   console.log("doesn't have number");
  return false;
}

function is_first_char_num(content: string) {
  const onlyNums = /^[0-9]+$/;

  if (content === null) {
    // console.log("empty string provided");
    return;
  }

  if (onlyNums.test(content[0]) == true) {
    // console.log("first char is num");
    return true;
  }
  //   console.log("doesn't have number");
  return false;
}

//add a list of what an identifier can be rules then consume until it doesn't fit it anymore

//rule 1. can't start with a number
//rule 2. cant end with an operator or other symbols e.g {} () :"<>?/\\\@#$%^&*"
//rule 3. can't have whitespace between

async function fileParse(filepath: string): Promise<string> {
  if (!filepath) throw new Error("FILEPATH IS NULL"); // Throw instead of return void

  try {
    const data = await readFile(filepath, "utf8");
    return data;
  } catch (err) {
    console.error(err);
    throw err; // Re-throw so the caller knows it failed
  }
}

async function main() {
  let path: string = "./main.ts";
  let data: string = await fileParse(path);
  tokinizer(data);
  console.log(tokenArray);
}

main();
