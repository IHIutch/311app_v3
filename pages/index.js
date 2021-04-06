import { useCallback, useEffect, useState } from "react";
import { GridItem } from "@chakra-ui/layout";
import { Grid } from "@chakra-ui/layout";
import { Box } from "@chakra-ui/layout";
import Head from "next/head";
import Container from "../components/common/Container";
import {
  setReports,
  useReportDispatch,
  useReportState,
} from "../context/reports";
import { getReports } from "../utils/api/reports";

const Home = () => {
  const { data: reports } = useReportState();
  const dispatch = useReportDispatch();
  const [isReportsLoading, setIsReportsLoading] = useState(false);

  const handleFetchReports = useCallback(async () => {
    try {
      setIsReportsLoading(true);
      const data = await getReports();
      const getAction = setReports(data);
      console.log(getAction);
      dispatch(getAction);
      setIsReportsLoading(false);
    } catch (error) {
      setIsReportsLoading(false);
      alert(error);
    }
  }, [dispatch]);

  useEffect(() => {
    handleFetchReports();
  }, [handleFetchReports]);

  return (
    <Box bg="gray.50">
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box>
        <Container>
          <Grid py="6" templateColumns="repeat(12, 1fr)" gap="6">
            <GridItem>Hey</GridItem>
            <GridItem>
              {reports &&
                Object.values(reports).map((r, idx) => (
                  <Box key={idx}>{r.id}</Box>
                ))}
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
