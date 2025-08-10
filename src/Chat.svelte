<script>
  import Login from './Login.svelte';
  import ChatMessage from './ChatMessage.svelte';
  import { onMount } from 'svelte';
  import { username, user, db } from './user';
  import debounce from 'lodash.debounce';

  import GUN from 'gun';

  let newMessage;
  let messages = [];

  let scrollBottom;
  let lastScrollTop;
  let canAutoScroll = true;
  let unreadMessages = false;

  function autoScroll() {
    setTimeout(() => scrollBottom?.scrollIntoView({ behavior: 'auto' }), 50);
    unreadMessages = false;
  }

  function watchScroll(e) {
    canAutoScroll = (e.target.scrollTop || Infinity) > lastScrollTop;
    lastScrollTop = e.target.scrollTop;
  }

  $: debouncedWatchScroll = debounce(watchScroll, 1000);

  onMount(() => {
    var match = {
      '.': {
        // property selector
        '>': new Date(+new Date() - 1 * 1000 * 60 * 60 * 3).toISOString(), // find any indexed property larger ~3 hours ago
      },
      '-': 1, // filter in reverse
    };

    // Get Messages
    db.get('fchat')
      .map(match)
      .once(async (data, id) => {
        if (data) {
          // Key for end-to-end encryption
          const key = '#foo';

          var message = {
            // transform the data
            who: await db.user(data).get('alias'), // user system detect whose data it is.
            what: (await SEA.decrypt(data.what, key)) + '', // force decrypt as text.
            when: GUN.state.is(data, 'what'), // get the internal timestamp for the what property.
          };

          if (message.what) {
            messages = [...messages.slice(-100), message].sort((a, b) => a.when - b.when);
            if (canAutoScroll) {
              autoScroll();
            } else {
              unreadMessages = true;
            }
          }
        }
      });
  });

  async function sendMessage() {
    const secret = await SEA.encrypt(newMessage, '#foo');
    const message = user.get('all').set({ what: secret });
    const index = new Date().toISOString();
    db.get('fchat').get(index).put(message);
    newMessage = '';
    canAutoScroll = true;
    autoScroll();
  }
</script>

<div class="container">
  {#if $username}
    <main on:scroll={debouncedWatchScroll}>
      {#each messages as message (message.when)}
        <ChatMessage {message} sender={$username} />
      {/each}

      <div class="dummy" bind:this={scrollBottom} />
    </main>

    
    {#if !canAutoScroll}
    <div class="scroll-button">
      <button on:click={autoScroll} class:red={unreadMessages}>
        {#if unreadMessages}
        <img src={`./chatnotification.png`}  alt="new chat"/>
        {:else}
        <img src={`./scrolldown.png`}  alt="scroll"/>
        {/if}
      </button>
      
    </div>
    
   {/if}
  {:else}
    <main>
      <Login />
    </main>
  {/if}
</div>
{#if $username}
<form on:submit|preventDefault={sendMessage}>
  <input type="text" placeholder="Type a Message" bind:value={newMessage} maxlength="100" />
  <button type="submit" disabled={!newMessage} class="btn mr-md-2 mb-md-0 mb-2 btn-outline-primary">
    <img src={`./send.png`} alt=" "/>SEND
        </button>
</form>
{/if}