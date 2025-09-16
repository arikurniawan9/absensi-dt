// Redirect to teacher login page

export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: '/auth/guru/login',
      permanent: false, // Set to false for a temporary redirect
    },
  };
}

export default function Home() {
  // This component will not be rendered because of the redirect.
  return null;
}
