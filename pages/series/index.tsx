import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return { redirect: { destination: '/sermons', permanent: true } };
};

export default function SeriesRedirect() { return null; }
