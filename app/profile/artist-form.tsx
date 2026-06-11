export default function ArtistProfileForm() {
  return (
    <div>
      <h1>Artist Profile</h1>
      <form>
        <input type="text" name="name" placeholder="Name" />
        <input type="text" name="email" placeholder="Email" />
        <button type="submit">Create Profile</button>
      </form>
    </div>
  );
}
