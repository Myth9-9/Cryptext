<script>
  import { username, user } from './user';

  function signout() {
    user.leave();
    username.set('');
  }
</script>

<header>
  {#if $username}
    <img align="left" src={`./jolly.png`} alt="Cryptext"/>
      <span><img src={`https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent($username || 'User')}`} alt="avatar" /></span>
      <span><strong>{$username}</strong></span>
      <span><button type="button" class="btn mr-md-2 mx-md-0 mb-2 btn-outline-primary btn-round" on:click={signout}>Sign Out</button></span>
    
      
    {:else}
      <h3>Cryptext</h3>
  {/if}
</header>