// Curated study content used for Quiz & Flashcards when GEMINI_API_KEY is not configured
// (or when the AI call fails). This is *learning content*, not student data.
//
// Question tuple: [difficulty 1-3, question, [options], correctIndex, explanation]
// Card tuple:     [front, back]

export const SUBJECT_INFO = {
  DAA: 'Design and Analysis of Algorithms',
  Backend: 'Backend Web Development (Node.js, Express, REST, MongoDB)',
  Python: 'Python Programming',
  Maths: 'Engineering Mathematics',
  DBMS: 'Database Management Systems',
  WebDevelopment: 'Web Development (HTML, CSS, JavaScript, React)',
  ACS: 'Advanced Communication Skills (English: tenses, arguments, counter-arguments, formal writing, presentations)',
  PandS: 'Probability and Statistics',
};

export const BANK = {
  DAA: {
    'Asymptotic Analysis': {
      q: [
        [1, 'Which notation gives a tight (two-sided) bound on running time?', ['Big-O', 'Big-Omega', 'Theta', 'Little-o'], 2, 'Theta bounds a function from above and below, so it is a tight bound.'],
        [2, 'What is the solution of T(n) = 2T(n/2) + n?', ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], 1, 'Master theorem case 2: f(n) = Θ(n^(log_2 2)) = Θ(n), giving Θ(n log n).'],
        [3, 'If f(n) = O(g(n)) and g(n) = O(h(n)), then:', ['f(n) = O(h(n))', 'h(n) = O(f(n))', 'f(n) = Θ(h(n))', 'Nothing can be said'], 0, 'Big-O is transitive: f is bounded by c1·g, which is bounded by c2·h.'],
      ],
      c: [
        ['What does Big-O notation describe?', 'An asymptotic upper bound on growth rate, commonly used for worst-case running time.'],
        ['State the Master Theorem idea.', 'For T(n) = aT(n/b) + f(n), compare f(n) with n^(log_b a); whichever dominates (or if equal, with a log factor) gives the solution.'],
        ['Big-O vs Theta?', 'Big-O is only an upper bound; Theta is both an upper and a lower (tight) bound.'],
      ],
    },
    'Divide and Conquer': {
      q: [
        [1, 'Worst-case time of binary search on a sorted array of n elements?', ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 1, 'Each step halves the search space, so O(log n).'],
        [2, 'Which recurrence describes merge sort?', ['T(n) = T(n-1) + n', 'T(n) = 2T(n/2) + n', 'T(n) = T(n/2) + 1', 'T(n) = 2T(n-1) + 1'], 1, 'Two halves are sorted recursively and merged in linear time.'],
        [3, 'Worst-case time of QuickSort when the pivot is always the smallest element?', ['O(n log n)', 'O(n)', 'O(n^2)', 'O(log n)'], 2, 'Partitions are maximally unbalanced: T(n) = T(n-1) + n = O(n^2).'],
      ],
      c: [
        ['Name the three steps of Divide and Conquer.', 'Divide the problem, Conquer the subproblems recursively, Combine their solutions.'],
        ['Why is merge sort always O(n log n)?', 'It always splits evenly (log n levels) and merging at each level costs linear time, independent of input order.'],
        ['What is the precondition of binary search?', 'The data must be sorted (or the predicate must be monotonic).'],
      ],
    },
    'Dynamic Programming': {
      q: [
        [1, 'Which two properties make a problem suitable for DP?', ['Greedy choice & optimal substructure', 'Overlapping subproblems & optimal substructure', 'Independent subproblems & divide', 'Backtracking & pruning'], 1, 'DP needs overlapping subproblems (to reuse results) and optimal substructure.'],
        [2, 'Time complexity of the 0/1 knapsack DP with n items and capacity W?', ['O(n + W)', 'O(nW)', 'O(2^n)', 'O(n log W)'], 1, 'The table has n × W entries, each computed in O(1).'],
        [3, 'In bottom-up LCS, if X[i] ≠ Y[j], then L[i][j] equals:', ['L[i-1][j-1]', 'max(L[i-1][j], L[i][j-1])', 'min(L[i-1][j], L[i][j-1])', 'L[i-1][j-1] + 1'], 1, 'When the last characters differ, the LCS comes from dropping one of them and taking the better result.'],
      ],
      c: [
        ['What is memoization?', 'Top-down DP: cache the result of each recursive call so every subproblem is solved once.'],
        ['Tabulation vs memoization?', 'Tabulation fills a table bottom-up iteratively; memoization recurses top-down with a cache.'],
        ['What does optimal substructure mean?', 'An optimal solution to the problem contains optimal solutions to its subproblems.'],
      ],
    },
    'Greedy Algorithms': {
      q: [
        [1, 'Fractional knapsack is solved greedily by picking items in order of:', ['Highest value', 'Lowest weight', 'Highest value/weight ratio', 'Random order'], 2, 'Taking the best value per unit weight first is optimal when items can be split.'],
        [2, 'Which of these is NOT a greedy algorithm?', ["Kruskal's MST", "Prim's MST", 'Huffman coding', 'Floyd-Warshall'], 3, 'Floyd-Warshall is dynamic programming over intermediate vertices.'],
        [3, "Dijkstra's algorithm can fail when the graph has:", ['Directed edges', 'Negative edge weights', 'Many vertices', 'Unweighted edges'], 1, 'Once a vertex is finalised it is never revisited, which breaks with negative weights.'],
      ],
      c: [
        ['What is the greedy-choice property?', 'A globally optimal solution can be built by making locally optimal choices.'],
        ['Why does Huffman coding use a min-heap?', 'To repeatedly extract the two lowest-frequency nodes and merge them.'],
        ['Kruskal vs Prim?', 'Kruskal adds the cheapest safe edge globally (using union-find); Prim grows a single tree from a start vertex.'],
      ],
    },
  },

  Backend: {
    'Node.js & Event Loop': {
      q: [
        [1, 'Node.js executes JavaScript using which engine?', ['Chrome V8', 'SpiderMonkey', 'Chakra', 'JavaScriptCore'], 0, "Node.js is built on Chrome's V8 engine."],
        [2, 'Which event-loop phase runs setTimeout callbacks?', ['poll', 'timers', 'check', 'close callbacks'], 1, 'The timers phase executes callbacks scheduled by setTimeout/setInterval.'],
        [3, 'In the main module, which is true for setTimeout(f,0), setImmediate(g), process.nextTick(h)?', ['h runs first; f and g order may vary', 'f, g, h', 'g, f, h', 'h, g, f always'], 0, 'nextTick callbacks run before the event loop continues; timeout vs immediate order is non-deterministic in the main module.'],
      ],
      c: [
        ['What is the event loop?', 'The mechanism that lets Node handle many async I/O operations on one thread by processing queued callbacks in phases (via libuv).'],
        ['Blocking vs non-blocking I/O?', 'Blocking halts the thread until the operation finishes; non-blocking schedules a callback/promise and continues.'],
        ['What is libuv?', "The C library that provides Node's event loop, thread pool and asynchronous I/O."],
      ],
    },
    'Express & Middleware': {
      q: [
        [1, 'An Express middleware function has the signature:', ['(req, res, next)', '(err, res)', '(req)', '(res, next)'], 0, 'Middleware receives the request, response and next callback.'],
        [2, 'What must a middleware do to pass control to the next handler?', ['Call next()', 'Return true', 'Call res.next()', 'Throw an error'], 0, 'Calling next() hands control to the next matching middleware/route.'],
        [3, 'How many parameters does an Express error-handling middleware have?', ['1', '2', '3', '4'], 3, 'Error handlers are declared as (err, req, res, next).'],
      ],
      c: [
        ['What does app.use() do?', 'Mounts middleware or routers that run, in declaration order, for matching requests.'],
        ['Why does middleware order matter?', 'Express runs middleware sequentially; e.g. the JSON body parser must come before routes that read req.body.'],
        ['What is express.Router?', 'A mini-application used to group related routes and mount them under a path.'],
      ],
    },
    'REST APIs': {
      q: [
        [1, 'Which HTTP method is idempotent and typically replaces a resource?', ['POST', 'PUT', 'CONNECT', 'TRACE'], 1, 'PUT replaces a resource and repeating it gives the same result.'],
        [2, 'Which status code means a resource was created?', ['200', '201', '204', '301'], 1, '201 Created is returned after a successful POST that creates a resource.'],
        [3, 'Which REST constraint says each request must carry all the information to process it?', ['Cacheable', 'Stateless', 'Layered system', 'Code on demand'], 1, 'Statelessness: the server stores no client session between requests.'],
      ],
      c: [
        ['What does REST stand for?', 'Representational State Transfer – an architectural style using resources, HTTP verbs and stateless requests.'],
        ['401 vs 403?', '401: not authenticated (missing/invalid credentials). 403: authenticated but not allowed to access the resource.'],
        ['What is idempotency?', 'Repeating the same request leaves the server in the same state (GET, PUT, DELETE are idempotent; POST is not).'],
      ],
    },
    'Authentication (JWT)': {
      q: [
        [1, 'A JWT consists of which three parts?', ['Header.Payload.Signature', 'Key.Value.Hash', 'Token.Secret.Salt', 'User.Password.Role'], 0, 'JWT = base64url(header).base64url(payload).signature.'],
        [2, 'How should passwords be stored in the database?', ['Plain text', 'bcrypt hash', 'Base64', 'Inside the JWT'], 1, 'bcrypt is a salted, slow hash designed for passwords.'],
        [3, 'Is a standard (JWS) JWT payload encrypted?', ['Yes, with AES', 'No, it is only base64url-encoded and signed', 'Yes, with RSA', 'Only when using HTTPS'], 1, 'Anyone can decode the payload; the signature only guarantees integrity.'],
      ],
      c: [
        ['How does JWT authentication work?', 'The server signs a token at login; the client sends it in the Authorization: Bearer header; the server verifies the signature on each request.'],
        ['Why hash passwords with bcrypt?', 'It is salted and intentionally slow, defeating rainbow tables and brute-force attacks.'],
        ['What is a refresh token for?', 'To obtain new short-lived access tokens without asking the user to log in again.'],
      ],
    },
  },

  Python: {
    'Data Structures': {
      q: [
        [1, 'Which of these Python types is immutable?', ['list', 'dict', 'tuple', 'set'], 2, 'Tuples cannot be modified after creation.'],
        [2, 'What does len({1, 2, 2, 3}) return?', ['4', '3', '2', 'Error'], 1, 'Sets discard duplicates, leaving {1, 2, 3}.'],
        [3, 'Average time complexity of a dict key lookup?', ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], 2, 'Dictionaries are hash tables, giving O(1) average lookups.'],
      ],
      c: [
        ['List vs tuple?', 'Lists are mutable; tuples are immutable (and hashable if their items are).'],
        ['What is a set?', 'An unordered collection of unique hashable items with O(1) average membership tests.'],
        ['What does a[::-1] do?', 'Returns a reversed copy of the sequence.'],
      ],
    },
    'Functions & Lambdas': {
      q: [
        [1, 'Which keyword creates an anonymous function?', ['def', 'lambda', 'func', 'anon'], 1, 'lambda creates small anonymous functions.'],
        [2, 'What does *args collect?', ['Keyword arguments as a dict', 'Extra positional arguments as a tuple', 'Only a list', 'Nothing'], 1, '*args packs additional positional arguments into a tuple.'],
        [3, 'What does this print? def f(x, l=[]): l.append(x); return l  →  f(1); print(f(2))', ['[2]', '[1, 2]', '[1]', 'Error'], 1, 'The default list is created once and shared between calls.'],
      ],
      c: [
        ['What is **kwargs?', 'It collects extra keyword arguments into a dictionary.'],
        ['What does map() do?', 'Applies a function to every item of an iterable and returns a lazy iterator.'],
        ['Explain the LEGB rule.', 'Name lookup order: Local, Enclosing, Global, Built-in.'],
      ],
    },
    'Object-Oriented Programming': {
      q: [
        [1, "Which method initialises a new instance's attributes?", ['__new__ only', '__init__', '__create__', '__start__'], 1, '__init__ runs after the object is created to set it up.'],
        [2, 'Python resolves multiple inheritance using:', ['Depth-first only', 'MRO (C3 linearisation)', 'Random order', 'Last class wins'], 1, 'The Method Resolution Order is computed with C3 linearisation.'],
        [3, 'What does super() give you?', ['A proxy to the parent following the MRO', 'The child class', 'A copy of self', 'None'], 0, 'super() returns a proxy object delegating to the next class in the MRO.'],
      ],
      c: [
        ['What is encapsulation?', 'Bundling data and methods in a class and restricting direct access (convention: _name, __name).'],
        ['What is polymorphism?', 'Different classes providing the same interface so one call works across many types.'],
        ['@classmethod vs @staticmethod?', 'classmethod receives cls; staticmethod receives neither self nor cls.'],
      ],
    },
    'Decorators & Generators': {
      q: [
        [1, 'Which keyword turns a function into a generator?', ['return', 'yield', 'generate', 'async'], 1, 'yield produces a value and pauses the function.'],
        [2, '@decorator placed above def f() is equivalent to:', ['f = decorator(f)', 'decorator = f(f)', 'f(decorator)', 'f = f(decorator)'], 0, 'The decorator receives the function and its return value replaces f.'],
        [3, 'Why are generators memory efficient?', ['They store every value', 'They produce values lazily one at a time', 'They run in parallel', 'They are always faster'], 1, 'Values are computed on demand instead of building the whole list.'],
      ],
      c: [
        ['What is a decorator?', 'A callable that wraps another function to extend its behaviour without modifying its source.'],
        ['What is an iterator?', 'An object implementing __iter__ and __next__ that yields items one at a time.'],
        ['yield vs return?', 'yield pauses the function and keeps its state to resume later; return ends it.'],
      ],
    },
  },

  Maths: {
    'Matrices & Eigenvalues': {
      q: [
        [1, 'The eigenvalues of A satisfy:', ['det(A − λI) = 0', 'A = λ', 'det(A) = λ', 'A² = λ'], 0, 'This is the characteristic equation.'],
        [2, 'The sum of the eigenvalues of a square matrix equals its:', ['Determinant', 'Trace', 'Rank', 'Order'], 1, 'Sum of eigenvalues = trace; product = determinant.'],
        [3, 'Cayley–Hamilton theorem states that every square matrix:', ['Is diagonalisable', 'Satisfies its own characteristic equation', 'Has real eigenvalues', 'Is invertible'], 1, 'If p(λ) is the characteristic polynomial, then p(A) = 0.'],
      ],
      c: [
        ['What is the rank of a matrix?', 'The maximum number of linearly independent rows (or columns).'],
        ['Define an eigenvector.', 'A non-zero vector v such that Av = λv for some scalar λ.'],
        ['When is a matrix invertible?', 'When its determinant is non-zero (full rank).'],
      ],
    },
    Calculus: {
      q: [
        [1, 'd/dx (sin x) =', ['cos x', '−cos x', '−sin x', 'tan x'], 0, 'The derivative of sine is cosine.'],
        [2, 'For a smooth f, a local maximum at x0 requires:', ["f'(x0) = 0 and f''(x0) < 0", "f'(x0) = 0 and f''(x0) > 0", "f'(x0) > 0", "f''(x0) = 0 only"], 0, 'Stationary point with negative second derivative is a local maximum.'],
        [3, '∫ x·eˣ dx =', ['eˣ(x − 1) + C', 'x eˣ + C', 'eˣ(x + 1) + C', 'x² eˣ / 2 + C'], 0, 'Integration by parts: x eˣ − ∫eˣ dx = eˣ(x − 1) + C.'],
      ],
      c: [
        ['State the chain rule.', "d/dx f(g(x)) = f'(g(x)) · g'(x)."],
        ['What is a partial derivative?', 'The derivative with respect to one variable while treating the others as constants.'],
        ['Integration by parts formula?', '∫u dv = uv − ∫v du.'],
      ],
    },
    'Differential Equations': {
      q: [
        [1, 'What is the order of d²y/dx² + y = 0?', ['0', '1', '2', '3'], 2, 'The highest derivative is the second derivative.'],
        [2, 'General solution of dy/dx = y:', ['y = Ceˣ', 'y = Cx', 'y = C + x', 'y = sin x'], 0, 'Separate variables: dy/y = dx → ln y = x + c.'],
        [3, 'For y″ + y = 0 the general solution is:', ['C1 eˣ + C2 e⁻ˣ', 'C1 cos x + C2 sin x', 'C1 + C2 x', 'C eˣ'], 1, 'Auxiliary equation m² + 1 = 0 gives m = ±i, so sine and cosine.'],
      ],
      c: [
        ['Order vs degree of an ODE?', 'Order: highest derivative present. Degree: power of that highest derivative (when polynomial in derivatives).'],
        ['Method for a linear first-order ODE?', 'Multiply by the integrating factor e^(∫P dx).'],
        ['Auxiliary equation for ay″ + by′ + cy = 0?', 'am² + bm + c = 0; its roots decide the form of the solution.'],
      ],
    },
    'Discrete Mathematics': {
      q: [
        [1, 'Number of edges in the complete graph Kₙ:', ['n(n−1)/2', 'n²', 'n(n+1)/2', '2n'], 0, 'Every pair of vertices is joined: C(n, 2).'],
        [2, 'A tree with n vertices has how many edges?', ['n', 'n − 1', 'n + 1', 'n / 2'], 1, 'A connected acyclic graph has exactly n − 1 edges.'],
        [3, 'The negation of (p → q) is:', ['¬p → ¬q', 'p ∧ ¬q', '¬p ∧ q', 'q → p'], 1, 'p → q is false only when p is true and q is false.'],
      ],
      c: [
        ['Define a bijection.', 'A function that is both injective (one-to-one) and surjective (onto).'],
        ['State the handshaking lemma.', 'The sum of all vertex degrees equals twice the number of edges.'],
        ['What is a tautology?', 'A proposition that is true under every truth assignment.'],
      ],
    },
  },

  DBMS: {
    Normalization: {
      q: [
        [1, 'First Normal Form (1NF) requires:', ['No partial dependency', 'Atomic column values', 'No transitive dependency', 'Every determinant is a key'], 1, '1NF forbids repeating groups and multi-valued cells.'],
        [2, 'A relation in 2NF has no:', ['Partial dependency of a non-prime attribute on a candidate key', 'Transitive dependency', 'Multi-valued attribute', 'Null value'], 0, '2NF removes partial dependencies on part of a composite key.'],
        [3, 'BCNF requires that for every non-trivial FD X → Y:', ['Y is prime', 'X is a superkey', 'X is prime', 'Y ⊆ X only'], 1, 'In BCNF every determinant must be a superkey.'],
      ],
      c: [
        ['What is normalization?', 'Organising tables to reduce redundancy and avoid insert, update and delete anomalies.'],
        ['What is a functional dependency?', 'X → Y means each value of X determines exactly one value of Y.'],
        ['3NF vs BCNF?', '3NF allows X → Y if X is a superkey OR Y is a prime attribute; BCNF requires X to always be a superkey.'],
      ],
    },
    SQL: {
      q: [
        [1, 'Which clause filters groups after aggregation?', ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], 1, 'HAVING applies conditions to aggregated groups.'],
        [2, 'Which join returns all rows from the left table?', ['INNER JOIN', 'LEFT OUTER JOIN', 'CROSS JOIN', 'SELF JOIN only'], 1, 'LEFT JOIN keeps all left rows, using NULLs for non-matches.'],
        [3, 'How do COUNT(*) and COUNT(col) differ?', ['No difference', 'COUNT(col) ignores NULLs; COUNT(*) does not', 'COUNT(*) ignores NULLs', 'COUNT(col) counts distinct values only'], 1, 'COUNT(*) counts rows; COUNT(col) counts non-NULL values.'],
      ],
      c: [
        ['WHERE vs HAVING?', 'WHERE filters rows before grouping; HAVING filters groups after aggregation.'],
        ['What is a primary key?', 'A minimal set of columns that uniquely identifies each row; it cannot be NULL.'],
        ['INNER vs LEFT JOIN?', 'INNER keeps only matching rows; LEFT keeps all left rows and fills NULLs where there is no match.'],
      ],
    },
    'Transactions & ACID': {
      q: [
        [1, 'Which ACID property guarantees all-or-nothing execution?', ['Atomicity', 'Consistency', 'Isolation', 'Durability'], 0, 'Atomicity: either every operation of the transaction is applied or none.'],
        [2, 'Durability means:', ['Committed data survives crashes', 'Transactions run serially', 'Constraints always hold', 'Locks are released'], 0, 'Once committed, changes persist even after failures.'],
        [3, 'Reading data written by an uncommitted transaction is called:', ['Dirty read', 'Phantom read', 'Lost commit', 'Deadlock'], 0, 'A dirty read sees uncommitted changes that may be rolled back.'],
      ],
      c: [
        ['Expand ACID.', 'Atomicity, Consistency, Isolation, Durability.'],
        ['What is a deadlock?', "Transactions wait on each other's locks forever; the DBMS detects it and aborts one."],
        ['What is two-phase locking?', 'A growing phase acquires locks and a shrinking phase releases them, ensuring conflict-serialisability.'],
      ],
    },
    'Indexing & B+ Trees': {
      q: [
        [1, 'The usual default index structure in relational databases:', ['B+ tree', 'Linked list', 'Stack', 'Heap file'], 0, 'B+ trees support equality and range lookups efficiently.'],
        [2, 'Why are B+ tree leaf nodes linked together?', ['Efficient range queries', 'Faster inserts only', 'To save space', 'For hashing'], 0, 'Following leaf links gives sorted range scans without climbing the tree.'],
        [3, 'A downside of creating too many indexes:', ['Slower writes and more storage', 'Slower reads', 'Data loss', 'There is no downside'], 0, 'Every insert/update/delete must also maintain each index.'],
      ],
      c: [
        ['What is an index?', 'An auxiliary structure that speeds up lookups at the cost of extra storage and slower writes.'],
        ['Clustered vs non-clustered index?', 'A clustered index defines the physical row order (one per table); non-clustered indexes store pointers to rows.'],
        ['B tree vs B+ tree?', 'B+ trees keep all records in linked leaves and only keys in internal nodes, making range scans faster.'],
      ],
    },
  },

  WebDevelopment: {
    'HTML & Semantic Markup': {
      q: [
        [1, 'Which element semantically marks main navigation links?', ['<div>', '<nav>', '<section>', '<span>'], 1, '<nav> identifies a block of navigation links.'],
        [2, 'Which attribute provides alternative text for an image?', ['title', 'alt', 'src', 'caption'], 1, 'alt text supports accessibility and is shown if the image fails to load.'],
        [3, 'Which element carries no semantic meaning?', ['<article>', '<main>', '<div>', '<header>'], 2, '<div> is a generic container.'],
      ],
      c: [
        ['What is semantic HTML?', 'Using elements that convey meaning (header, nav, article) to improve accessibility and SEO.'],
        ['Block vs inline elements?', 'Block elements start on a new line and fill the width; inline elements flow within text.'],
        ['Purpose of the viewport meta tag?', 'It controls page scaling on mobile devices for responsive layouts.'],
      ],
    },
    'CSS Layout': {
      q: [
        [1, 'Which declaration creates a flex container?', ['display: flex', 'position: flex', 'flex: container', 'layout: flex'], 0, 'display: flex turns the element into a flex container.'],
        [2, 'The CSS box model from inside to outside is:', ['content, padding, border, margin', 'content, margin, padding, border', 'padding, content, border, margin', 'border, content, padding, margin'], 0, 'Content is wrapped by padding, then border, then margin.'],
        [3, 'Which selector has the highest specificity?', ['Element', 'Class', 'ID', 'Universal'], 2, 'ID selectors outrank class and element selectors.'],
      ],
      c: [
        ['Flexbox vs Grid?', 'Flexbox lays out in one dimension (row or column); Grid handles two dimensions.'],
        ['What does box-sizing: border-box do?', 'Width and height include padding and border.'],
        ['What are media queries?', 'Conditional CSS rules based on viewport or device features, used for responsive design.'],
      ],
    },
    'JavaScript Fundamentals': {
      q: [
        [1, 'What does typeof null return in JavaScript?', ['"null"', '"object"', '"undefined"', '"number"'], 1, 'A long-standing quirk: typeof null is "object".'],
        [2, 'Which keyword declares a block-scoped variable?', ['var', 'let', 'global', 'def'], 1, 'let (and const) are block scoped; var is function scoped.'],
        [3, 'What does === check?', ['Value only', 'Value and type without coercion', 'Reference only', 'Type only'], 1, 'Strict equality compares type and value with no coercion.'],
      ],
      c: [
        ['What is a closure?', 'A function that remembers variables from its lexical scope even after the outer function has returned.'],
        ['Promises vs async/await?', 'async/await is syntax built on Promises that lets asynchronous code read sequentially.'],
        ['What is event delegation?', 'Attaching one listener to a parent to handle events from many children via bubbling.'],
      ],
    },
    'React Basics': {
      q: [
        [1, 'Which hook adds state to a function component?', ['useState', 'useClass', 'setState only', 'useData'], 0, 'useState returns the current state and a setter.'],
        [2, 'useEffect with an empty dependency array [] runs:', ['On every render', 'Once after the first render', 'Never', 'Before rendering'], 1, 'An empty array means no dependencies, so it runs only on mount.'],
        [3, 'Why do list items need a key prop?', ['For styling', 'So React can identify items for efficient updates', 'HTML requires it', 'To sort items'], 1, 'Stable keys let React match items between renders.'],
      ],
      c: [
        ['What is JSX?', 'A syntax extension that lets you write HTML-like markup inside JavaScript.'],
        ['Props vs state?', 'Props are read-only inputs passed from a parent; state is data owned and updated by the component.'],
        ['What is the virtual DOM?', 'An in-memory UI representation that React diffs to apply minimal real DOM updates.'],
      ],
    },
  },

  ACS: {
    Tenses: {
      q: [
        [1, 'Choose the correct sentence: "She ___ to college every day."', ['go', 'goes', 'going', 'gone'], 1, 'A third-person singular subject takes "goes" in the simple present.'],
        [2, '"I have been studying for two hours." is which tense?', ['Present perfect continuous', 'Past perfect', 'Present continuous', 'Simple past'], 0, 'have/has + been + verb-ing = present perfect continuous.'],
        [3, 'Select the correct form: "By next year, she ___ her degree."', ['will complete', 'will have completed', 'has completed', 'completed'], 1, 'Future perfect (will have + past participle) shows completion before a future time.'],
      ],
      c: [
        ['When do we use the present perfect?', 'For actions completed with present relevance or at an unspecified time: have/has + past participle.'],
        ['Simple past vs present perfect?', 'Simple past: finished time stated (yesterday). Present perfect: no definite time, connected to now.'],
        ['How is the future perfect formed?', 'will have + past participle; it describes an action completed before a future moment.'],
      ],
    },
    'Arguments & Counter-arguments': {
      q: [
        [1, 'A counter-argument is:', ['A restatement of your claim', 'An opposing view that you address', 'A conclusion', 'An example'], 1, 'Good writers acknowledge opposing views and respond to them.'],
        [2, "In Toulmin's model, the 'warrant' is:", ['The claim', 'The reasoning linking evidence to the claim', 'The rebuttal', 'The conclusion'], 1, 'The warrant explains why the evidence supports the claim.'],
        [3, '"Everyone believes it, so it must be true" is which fallacy?', ['Ad hominem', 'Bandwagon', 'Straw man', 'Slippery slope'], 1, 'Appealing to popularity is the bandwagon fallacy.'],
      ],
      c: [
        ['What are the parts of a strong argument?', 'A claim, supporting evidence, reasoning, and acknowledgement/rebuttal of counter-arguments.'],
        ['How do you rebut a counter-argument?', 'Acknowledge it, show its limits or flaws using evidence, then reaffirm your claim.'],
        ['What is a straw man fallacy?', "Misrepresenting an opponent's position to make it easier to attack."],
      ],
    },
    'Formal Writing': {
      q: [
        [1, 'The most appropriate email opening to a professor:', ['Hey!', 'Dear Professor Rao,', 'Yo prof,', 'Hi buddy,'], 1, 'A polite, formal salutation is expected.'],
        [2, 'Formal writing should generally avoid:', ['Contractions and slang', 'Clear structure', 'Precise vocabulary', 'Proofreading'], 0, 'Contractions and slang make the tone informal.'],
        [3, 'Which sentence is the most concise?', ['Due to the fact that it rained, we left.', 'Because it rained, we left.', 'On account of the fact of rain, we left.', 'It rained, therefore the reason we left.'], 1, '"Because" replaces the wordy "due to the fact that".'],
      ],
      c: [
        ['What is the structure of a formal letter?', "Sender's address, date, receiver's address, salutation, subject, body, complimentary close, signature."],
        ['Active vs passive voice?', 'Active: the subject performs the action. Passive: the subject receives it; prefer active for clarity.'],
        ['What is a thesis statement?', 'One sentence stating the main claim of an essay.'],
      ],
    },
    'Presentation Skills': {
      q: [
        [1, 'Good slide design uses:', ['Paragraphs of text', 'A few key points with visuals', 'Tiny fonts', 'Reading every word aloud'], 1, 'Slides should support the speaker, not replace them.'],
        [2, 'A strong way to open a presentation:', ['Apologise for being nervous', 'Start with a hook such as a question or fact', 'Read the title only', 'Start with Q&A'], 1, 'A hook captures attention immediately.'],
        [3, "The 'rule of three' in speaking means:", ['Speak for three minutes', 'Group ideas in threes for memorability', 'Use three slides', 'Pause three times'], 1, 'Three points are easy to remember and feel complete.'],
      ],
      c: [
        ['What is the structure of a presentation?', 'Introduction (hook, purpose), body (key points), conclusion (summary, call to action).'],
        ['How can you manage nervousness?', 'Prepare and rehearse, breathe slowly, focus on your message, and make eye contact with friendly faces.'],
        ['Why does body language matter?', 'Posture, gestures and eye contact reinforce or undermine your spoken message.'],
      ],
    },
  },

  PandS: {
    'Probability Basics': {
      q: [
        [1, 'For mutually exclusive events, P(A ∪ B) =', ['P(A) + P(B)', 'P(A)·P(B)', 'P(A) − P(B)', '1'], 0, 'With no overlap the probabilities simply add.'],
        [2, 'Two fair dice are rolled. P(sum = 7) =', ['1/6', '1/12', '7/36', '1/9'], 0, 'Six of the 36 outcomes sum to 7.'],
        [3, 'P(at least one head in 3 fair coin tosses) =', ['7/8', '3/8', '1/8', '1/2'], 0, '1 − P(no heads) = 1 − (1/2)³ = 7/8.'],
      ],
      c: [
        ['Define conditional probability.', 'P(A|B) = P(A ∩ B) / P(B), provided P(B) > 0.'],
        ['What are independent events?', "One event's occurrence doesn't change the other's probability: P(A ∩ B) = P(A)P(B)."],
        ['State the addition rule.', 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B).'],
      ],
    },
    'Bayes Theorem': {
      q: [
        [1, "Bayes' theorem states P(A|B) =", ['P(B|A)·P(A) / P(B)', 'P(A)·P(B)', 'P(B|A) / P(A)', 'P(A ∩ B)·P(B)'], 0, 'Posterior = likelihood × prior / evidence.'],
        [2, "In Bayes' theorem, P(A) is called the:", ['Posterior', 'Prior', 'Likelihood', 'Evidence'], 1, 'The prior is your belief before seeing the evidence.'],
        [3, 'Prevalence 1%, sensitivity 90%, false-positive rate 5%. P(disease | positive) ≈', ['15%', '90%', '50%', '5%'], 0, '0.009 / (0.009 + 0.0495) ≈ 0.154.'],
      ],
      c: [
        ['State the law of total probability.', 'P(B) = Σ P(B|Aᵢ)·P(Aᵢ) over a partition {Aᵢ}.'],
        ['Prior vs posterior?', 'Prior: belief before evidence. Posterior: updated belief after evidence.'],
        ['What is likelihood?', 'P(evidence | hypothesis).'],
      ],
    },
    Distributions: {
      q: [
        [1, 'The mean of a Binomial(n, p) distribution is:', ['np', 'npq', 'n/p', 'p'], 0, 'Expected successes = n × p.'],
        [2, 'The normal distribution is symmetric about its:', ['Mean', 'Range', 'Variance', 'Maximum value'], 0, 'Mean, median and mode coincide at the centre.'],
        [3, 'A Poisson distribution has:', ['Mean = variance = λ', 'Mean λ and variance λ²', 'Variance 0', 'Mean 0'], 0, 'Equal mean and variance is a defining feature of the Poisson.'],
      ],
      c: [
        ['What are the binomial conditions?', 'Fixed n trials, two outcomes, independent trials, constant success probability p.'],
        ['State the empirical rule.', 'In a normal distribution about 68%, 95% and 99.7% of data lie within 1, 2 and 3 SD of the mean.'],
        ['When is the Poisson model used?', 'For counting rare events in a fixed interval with a constant average rate λ.'],
      ],
    },
    'Descriptive Statistics': {
      q: [
        [1, 'The median of 3, 1, 7, 5, 9 is:', ['5', '7', '1', '25'], 0, 'Sorted: 1, 3, 5, 7, 9 → middle value is 5.'],
        [2, 'Which measure is least affected by outliers?', ['Mean', 'Median', 'Range', 'Variance'], 1, 'The median depends only on the middle position.'],
        [3, 'Variance is:', ['The square root of SD', 'The average squared deviation from the mean', 'The mean absolute deviation', 'The range squared'], 1, 'Variance = mean of (x − μ)².'],
      ],
      c: [
        ['Mean vs median?', 'Mean is the arithmetic average (outlier-sensitive); median is the middle value (robust).'],
        ['What is standard deviation?', 'The square root of the variance: the typical distance of data from the mean.'],
        ['What is correlation?', 'A measure (−1 to 1) of the strength and direction of linear association between two variables.'],
      ],
    },
  },
};

// Map canonical subject aliases so that both short and canonical full names resolve
BANK.Mathematics = BANK.Maths;
BANK['Web Development'] = BANK.WebDevelopment;
BANK['P and S'] = BANK.PandS;
BANK.PandS = BANK.PandS;
BANK.PNS = BANK.PandS;

SUBJECT_INFO.Mathematics = SUBJECT_INFO.Maths;
SUBJECT_INFO['Web Development'] = SUBJECT_INFO.WebDevelopment;
SUBJECT_INFO['P and S'] = SUBJECT_INFO.PandS;
SUBJECT_INFO.PandS = SUBJECT_INFO.PandS;
SUBJECT_INFO.PNS = SUBJECT_INFO.PandS;

export const normalizeBankSubject = (subject) => {
  if (!subject) return 'DAA';
  const clean = String(subject).trim();
  if (clean === 'All' || clean === 'All Subjects' || clean === 'all') return 'All';
  if (clean === 'Maths' || clean === 'Mathematics') return 'Mathematics';
  if (clean === 'WebDevelopment' || clean === 'Web Development') return 'Web Development';
  if (clean === 'PandS' || clean === 'PNS' || clean === 'P and S') return 'P and S';
  return clean;
};

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const words = (s) => norm(s).split(' ').filter((w) => w.length >= 4);

// Find the bank topic that best matches free-text topic; returns topic name or null
export function matchBankTopic(subject, topic) {
  const normSub = normalizeBankSubject(subject);
  const topics = Object.keys(BANK[normSub] || BANK[subject] || {});
  const t = norm(topic);
  if (!t || !topics.length) return null;
  for (const name of topics) {
    const n = norm(name);
    if (n.includes(t) || t.includes(n)) return name;
  }
  const tw = words(topic);
  let best = null;
  let bestScore = 0;
  for (const name of topics) {
    const nw = words(name);
    const score = tw.filter((w) => nw.some((x) => x.startsWith(w.slice(0, 5)) || w.startsWith(x.slice(0, 5)))).length;
    if (score > bestScore) {
      best = name;
      bestScore = score;
    }
  }
  return best;
}

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const DIFF_LEVEL = { Easy: 1, Medium: 2, Hard: 3 };

export function bankQuestions(subject, topic, difficulty = 'Medium', count = 5) {
  const normSub = normalizeBankSubject(subject);

  // When 'All' or 'All Subjects' is chosen, sample questions across all 8 canonical subjects
  if (normSub === 'All') {
    const canonicalList = ['DAA', 'Backend', 'Python', 'Mathematics', 'DBMS', 'ACS', 'Web Development', 'P and S'];
    let allQ = [];
    const level = DIFF_LEVEL[difficulty] || 2;
    canonicalList.forEach((subName) => {
      const subj = BANK[subName];
      if (subj) {
        Object.entries(subj).forEach(([tName, val]) => {
          if (val.q && Array.isArray(val.q)) {
            val.q.forEach((row) => {
              allQ.push({
                question: row[1],
                options: row[2],
                correctIndex: row[3],
                explanation: row[4],
                topic: tName,
                subject: subName,
                _d: row[0],
              });
            });
          }
        });
      }
    });
    const byDiff = (arr) => arr.filter((q) => q._d === level);
    let pool = [...shuffle(byDiff(allQ)), ...shuffle(allQ.filter((q) => q._d !== level))];
    const chosen = pool.slice(0, count);
    const questions = shuffle(chosen).map(({ _d, ...q }) => {
      const order = shuffle(q.options.map((_, i) => i));
      return {
        ...q,
        options: order.map((i) => q.options[i]),
        correctIndex: order.indexOf(q.correctIndex),
      };
    });
    return { questions, matchedTopic: null };
  }

  const subj = BANK[normSub] || BANK[subject];
  if (!subj) return { questions: [], matchedTopic: null };
  const matched = matchBankTopic(normSub, topic);
  const level = DIFF_LEVEL[difficulty] || 2;

  const toQ = (topicName) => (row) => ({
    question: row[1],
    options: row[2],
    correctIndex: row[3],
    explanation: row[4],
    topic: topicName,
    subject: normSub,
    _d: row[0],
  });

  const primary = matched ? subj[matched].q.map(toQ(matched)) : [];
  const others = Object.entries(subj)
    .filter(([name]) => name !== matched)
    .flatMap(([name, v]) => v.q.map(toQ(name)));

  // Closest-to-requested-difficulty first, with random tie-break
  const rank = (arr) => shuffle(arr).sort((a, b) => Math.abs(a._d - level) - Math.abs(b._d - level));
  const pool = [...shuffle(primary), ...rank(others)];
  const chosen = pool.slice(0, count);

  // Shuffle options so the correct answer position varies
  const questions = shuffle(chosen).map(({ _d, ...q }) => {
    const order = shuffle(q.options.map((_, i) => i));
    return {
      ...q,
      options: order.map((i) => q.options[i]),
      correctIndex: order.indexOf(q.correctIndex),
    };
  });
  return { questions, matchedTopic: matched };
}

export function bankFlashcards(subject, topic, count = 8) {
  const normSub = normalizeBankSubject(subject);

  // When 'All' or 'All Subjects' is chosen, sample cards across all 8 canonical subjects
  if (normSub === 'All') {
    const canonicalList = ['DAA', 'Backend', 'Python', 'Mathematics', 'DBMS', 'ACS', 'Web Development', 'P and S'];
    let allCards = [];
    canonicalList.forEach((subName) => {
      const subj = BANK[subName];
      if (subj) {
        Object.entries(subj).forEach(([tName, val]) => {
          if (val.c && Array.isArray(val.c)) {
            val.c.forEach((row) => {
              allCards.push({
                front: row[0],
                back: row[1],
                topic: tName,
                subject: subName,
              });
            });
          }
        });
      }
    });
    return { cards: shuffle(allCards).slice(0, count), matchedTopic: null };
  }

  const subj = BANK[normSub] || BANK[subject];
  if (!subj) return { cards: [], matchedTopic: null };
  const matched = matchBankTopic(normSub, topic);
  const toC = (name) => (row) => ({ front: row[0], back: row[1], topic: name, subject: normSub });
  const primary = matched ? subj[matched].c.map(toC(matched)) : [];
  const others = Object.entries(subj)
    .filter(([name]) => name !== matched)
    .flatMap(([name, v]) => v.c.map(toC(name)));
  return { cards: [...shuffle(primary), ...shuffle(others)].slice(0, count), matchedTopic: matched };
}

export const bankTopics = (subject) => {
  const normSub = normalizeBankSubject(subject);
  return Object.keys(BANK[normSub] || BANK[subject] || {});
};
