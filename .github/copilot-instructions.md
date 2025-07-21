### 🔥 Coding Rules for High-Quality, Readable Code

- Always create **named arrow functions**, never anonymous or inline.
- Always export **named values** — NEVER use `default` exports.
- Always use a **single argument object**, never destructure in the function signature.
- Always type the argument object as `(args: ArgsT) => { ... }`.
- Custom types should always be written using `type` (not `interface`) and use the `T` suffix: `UserT`, `MessageT`, `ArgsT`, etc.
- Write **explicit code** — no magic, no assumptions.
- Always use explicit `return`s except in narrow, trivially clear one-liners.
- NEVER nest unnecessarily — prioritize **flat control flow**.
- Always return early where possible — **never bury the exit**.
- Eliminate `else` and `else if` — conditionals should resolve and drop out cleanly.
- Avoid switch blocks — use clear `if` guards + early exits.
- Always name boolean values with interrogative prefixes:
  - `isSelected`, `canSubmit`, `hasError`, `didClick`, `willLoadSoon`
- Prioritize **modular**, **reusable** logic split into **clear, focused units**.
- Logic should be easy to follow without vertical scrolling — avoid vertical "maze" code.
- Write for **readability**, not for brevity. Every line should explain itself.
- Avoid abbreviations entirely — **clarity always beats cleverness**.

### 📁 Function Style & Structure

```ts
type ArgsT = {
  // write clear and complete type shapes
}

export const someFunction = (args: ArgsT) => {
  // declare only named constants — never inline complex logic
  // do not nest logic; flatten the DAG
  // return early, never hang onto conditions

  return ...
}
```

### 🧼 Clean Code = Maintainable Code

- ❌ Never destructure arguments in the function signature.
- ✅ Access everything with dot notation from the argument object.
- ❌ Never nest conditionals or wrap logic in layered branches.
- ✅ Always return early to flatten logic.
- ❌ Don't write "mystery" variables like `e`, `x`, `dx`.
- ✅ Be verbose if it helps readability — `mouseX`, `totalBalance`, etc.
- ✅ Prefer standalone named helpers to embedded logic.
- ❌ Don’t write one-liners that obscure meaning.

```ts
// ✅ GOOD — readable and flat
const isSameUser = args.userId === account.id
if (!isSameUser) return 'unauthorized'


const xDiff = args.clientX - event.clientX
const boundingBox = element.getBoundingClientRect()


const getDimensions = (el: HTMLElement): DOMRect => {
  return el.getBoundingClientRect()
}


// ❌ BAD — untraceable, unreadable
const getData = ({ a, b }) => ({
  r: a + b / 2
})
```

## FLAT CODE (BAD) / NESTED CODE (BAD) EXAMPLES

```js
const someFunction = () => {
  // ❌ BAD: BLOCK CAN BE ELIMINATED.
  if (foo) {
    throw new Error('foo bar')
  }

  // ✅ GOOD: ONE LINER IF STATEMENT
  if (foo) throw new Error('foo bar')

  // ❌ BAD: BLOCK CAN BE ELIMINATED.
  if (foo) {
    return
  }

  // ✅ GOOD: ONE LINER IF STATEMENT
  if (foo) return

    // ❌ BAD: MISSED OPPORTUNITY TO RETURN EARLY AND
    // ELIMINATE USAGE OF ELSE BLOCK.
  if (foo) {
    doSomething()
    doSomethingElse()
  } else {
    doSomethingElse()
  }

  // ✅ GOOD: NO ELSE BLOCK. EARLY RETURN PREFERRED
  // AS FORM OF CONTROL FLOW.
  if (foo) {
    doSomething()
    doSomethingElse()
    return
  }

  doSomethingElse()



  // ✅THIS IS THE ONLY CASE SOMETHING SHOULD BE IMPLICITLY RETURNED,
  // WHEN A METHOD CAN BE HANDLED ELEGANTLY IN A ONE LINER:
  activeVoices.forEach(voice => voice.stop()

  // ❌YOU SHOULD NEVER DO THIS AND TAKE UP A WHOLE LINE JUST FOR SOMETHING
  // SIMPLE LIKE voice.stop().
  activeVoices.forEach(voice => {
    voice.stop()
  })
}


### 📌 Summary of DOs and DON'Ts

| ✅ DO                                               | ❌ DON'T                                     |
| --------------------------------------------------- | -------------------------------------------- |
| Use `type`, and suffix custom types with `T`       | Use `interface`, omit type names             |
| Always use dot notation (`args.value`)             | Destructure inside the function signature     |
| Return early with clarity                          | Nest `if`, `else`, `switch`, etc. unnecessarily |
| Use long, semantic names                           | Use cryptic/short variable names             |
| Keep functions flat and logic shallow              | Write shape-shifting, nested logic blocks     |
| Extract helpers when logic grows                   | Cram complex logic inline                     |
| Use pure functions and isolate responsibility      | Mix side effects or responsibilities         |

Write **modular**, write **flat**, write **readable**.

Build every line for the person reading it next.

A developer could walk in tomorrow -- with any level of experience, from any cultural background, from any walk of life.
All we know about them is that they speak english. That is IT. So our code needs to be as EASY to visually parse / follow
as possible for any day 1 juniors, it needs to be as READABLE WITH ENGLISH LANGUAGE as possible, and it needs to achieve
the complete logic we set forth in the requirements.
