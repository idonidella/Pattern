import React from 'react';

function initialPage(){
    return (
    <header>
      <link rel="stylesheet" type="text/css" href="styles.css" />
        <script src="styles.css"></script>
  <section class="hero">
    <h1 class="hero-message">
      <div>Hero layout with</div>
      <div>Open Props</div>
    </h1>
    <p class="under-hero">Lorem ipsum dolor sit amet consectetu adipisicing elit. Nemo in doloremque quam, voluptatibus eum voluptatum.</p>
    <div class="button-list">
      <button class="primary">Get started</button>
      <button>Live demo</button>
    </div>
  </section>
  <picture class="promo-art">
    <img src="https://doodleipsum.com/700x700/outline?bg=3b5bdb" height="800" width="800" alt="a random doodle"></img>
  </picture>
</header>

    );
}
export default initialPage;