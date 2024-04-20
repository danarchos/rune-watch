"use client";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";

export default function Page() {
  const [data, setData] = useState<any>(null);
  const [hidePremineRows, setHidePremineRows] = useState(false);
  const [blockCount, setBlockCount] = useState(1000000);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ field: "", direction: "" });
  const [timeFilter, setTimeFilter] = useState("all");
  const [originalData, setOriginalData] = useState([]);

  useEffect(() => {
    const now = Date.now();
    const filteredData = originalData.filter((item: any) => {
      switch (timeFilter) {
        case "1h":
          return now - item.timestamp < 3600000; // 1 hour in milliseconds
        case "1d":
          return now - item.timestamp < 86400000; // 1 day in milliseconds
        case "1w":
          return now - item.timestamp < 604800000; // 1 week in milliseconds
        case "all":
        default:
          return true; // No filter applied
      }
    });

    setData(filteredData);
  }, [timeFilter, originalData]);

  useEffect(() => {
    if (!data) return;

    // @ts-ignore
    const sortData = (data, { field, direction }) => {
      return [...data].sort((a, b) => {
        // Convert to integers if sorting by fields that are numeric
        let first =
          field === "mints" || field === "maxSupply"
            ? parseInt(a[field])
            : a[field];
        let second =
          field === "mints" || field === "maxSupply"
            ? parseInt(b[field])
            : b[field];

        if (first < second) {
          return direction === "ascending" ? -1 : 1;
        }
        if (first > second) {
          return direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    };

    const sortedData = sortData(data, sortConfig);
    setData(sortedData);
  }, [sortConfig]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/runes`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await res.json();

        setBlockCount(result.blockCount);
        if (result && result.data) {
          // Map and enrich data
          const enrichedData = result.data.map((item: any) => ({
            ...item,
            circulatingSupply:
              parseInt(item.mints) * parseInt(item.amount) +
              parseInt(item.premine),
            percentMinted: item.cap
              ? ((parseInt(item.cap) - item.remaining) / parseInt(item.cap)) *
                100
              : 0,
            maxSupply:
              parseInt(item.cap) * parseInt(item.amount) +
              parseInt(item.premine),
            timestamp: new Date(item.timestamp).getTime(), // Convert to time in milliseconds once here
          }));

          enrichedData.sort((a: any, b: any) => a.number - b.number);
          setOriginalData(enrichedData); // Set original data
          setData(enrichedData); // Set viewable data
        }
        setLoading(false);
      } catch (error) {
        console.error("Fetching data failed:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const togglePremineVisibility = () => {
    setHidePremineRows(!hidePremineRows);
  };

  const renderLargeNumber = (supply: string) => {
    const num = parseInt(supply);
    if (isNaN(num)) return "-";

    const formatNumber = (value: number, divisor: number, suffix: string) => {
      let formatted = (value / divisor).toFixed(1); // Format with one decimal place
      // Remove ".0" if it ends with it to avoid showing unnecessary zeros
      if (formatted.endsWith(".0")) {
        formatted = formatted.substring(0, formatted.length - 2);
      }
      return `${formatted}${suffix}`;
    };

    if (num >= 10000000000000000000000000000) {
      return "∞";
    }

    if (num >= 1000000000000) {
      return formatNumber(num, 1000000000000, "T");
    }

    if (num >= 1000000000) {
      return formatNumber(num, 1000000000, "B");
    }

    if (num >= 1000000) {
      return formatNumber(num, 1000000, "M");
    }

    if (num >= 1000) {
      return formatNumber(num, 1000, "K");
    }

    return num.toString(); // Return the number as a string for consistency
  };

  const renderSortArrow = (fieldName: any) => {
    if (sortConfig.field !== fieldName) {
      return null; // No arrow if not sorting by this column
    }
    return sortConfig.direction === "ascending" ? " ↑" : " ↓";
  };

  const renderPercentLeft = (remaining: number, cap: number) => {
    if (!remaining || !cap) return "-";
    const number = ((cap - remaining) / cap) * 100;
    if (number < 0.01) return 0 + "%";
    if (number >= 10) return number.toFixed(0) + "%";
    return number.toFixed(1) + "%";
  };

  const requestSort = (field: any) => {
    let direction = "ascending"; // Default to ascending
    // If currently sorting by this field and in ascending, switch to descending
    if (sortConfig.field === field && sortConfig.direction === "ascending") {
      direction = "descending";
    } else if (
      sortConfig.field === field &&
      sortConfig.direction === "descending"
    ) {
      direction = "ascending"; // Cycle back to ascending instead of clearing
    }
    setSortConfig({ field, direction });
  };

  // @ts-ignore
  const renderMaxSupply = (cap: string, amount: string, premine: string) => {
    // Convert strings to BigInt
    const bigCap = BigInt(cap);
    const bigAmount = BigInt(amount);
    const bigPremine = BigInt(premine);

    // Perform arithmetic with BigInt
    const bigNumber = bigCap * bigAmount + bigPremine;

    // Since renderLargeNumber might not support BigInt, you will need to convert it safely
    return renderLargeNumber(bigNumber.toString());
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center pb-8 px-4">
      <div className="mt-6 flex flex-row gap-2 items-center justify-between w-full pl-2 pr-2">
        <Logo />
        <span className="text-xs">
          (Updates every 10 mins. Use ordinals.com for real-time data)
        </span>
        <div className="flex">
          <button
            className={`px-3 py-1 mx-1 text-sm font-medium rounded-md ${
              timeFilter === "1h"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setTimeFilter("1h")}
          >
            1h
          </button>
          <button
            className={`px-3 py-1 mx-1 text-sm font-medium rounded-md ${
              timeFilter === "1d"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setTimeFilter("1d")}
          >
            1d
          </button>
          <button
            className={`px-3 py-1 mx-1 text-sm font-medium rounded-md ${
              timeFilter === "1w"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setTimeFilter("1w")}
          >
            1w
          </button>
          <button
            className={`px-3 py-1 mx-1 text-sm font-medium rounded-md ${
              timeFilter === "all"
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
            onClick={() => setTimeFilter("all")}
          >
            All
          </button>
        </div>
      </div>

      <ThreeDots
        visible={loading}
        height="80"
        width="80"
        color="#5744b5"
        radius="9"
        ariaLabel="three-dots-loading"
        // @ts-ignore
        wrapperStyle={{ marginTop: 100 }}
      />

      {!loading && (
        <div className="w-full overflow-x-auto mt-6 ">
          <table className="min-w-full divide-y table-auto text-center">
            <thead>
              <tr className="text-xs">
                <th
                  className="text-left px-4 py-2 cursor-pointer"
                  onClick={() => requestSort("number")}
                >
                  {renderSortArrow("number")} Rune
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => requestSort("amount")}
                >
                  {renderSortArrow("amount")} Supply Per Mint
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => requestSort("circulatingSupply")}
                >
                  {renderSortArrow("circulatingSupply")} Circulating Supply
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => requestSort("percentMinted")}
                >
                  {renderSortArrow("percentMinted")} % Minted
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => requestSort("maxSupply")}
                >
                  {renderSortArrow("maxSupply")} Max Supply
                </th>
                <th
                  className="px-4 py-2 cursor-pointer"
                  onClick={() => requestSort("mints")}
                >
                  {renderSortArrow("mints")} Mint Transactions
                </th>

                <th className="px-4 py-2">
                  Premine{" "}
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={togglePremineVisibility}
                  >
                    {hidePremineRows ? "👀" : "🚫"}
                  </span>
                </th>
                <th className="px-4 py-2">Mintable</th>
              </tr>
            </thead>

            <tbody>
              {data
                ?.filter((item: any) => !hidePremineRows || item.premine <= 0)
                .map((item: any, index: number) => (
                  <tr key={index}>
                    {/* Name */}
                    <Link
                      href={`https://ordinals.com/rune/${item.title}`}
                      target="_blank"
                    >
                      <td className="text-left px-4 py-2 flex flex-row items-center">
                        <div className="bg-[#494366] w-[40px] p-1 items-center flex justify-center mr-4 rounded">
                          <span>#{item.number}</span>
                        </div>

                        <div className="w-[50px] flex items-center justify-center text">
                          <span className="text-3xl">{item.symbol}</span>
                        </div>

                        <span className="ml-2">{item.title}</span>
                      </td>
                    </Link>
                    {/* Mint Amount */}
                    <td className="px-4 py-2">
                      {renderLargeNumber(item.amount)}
                    </td>
                    {/* Circulating Supply */}
                    <td className="px-4 py-2">
                      {renderLargeNumber(
                        (
                          parseInt(item.mints) * parseInt(item.amount) +
                          parseInt(item.premine)
                        ).toString()
                      )}
                    </td>

                    {/* Total Mints */}
                    <td className="px-4 py-2">
                      {renderPercentLeft(item.remaining, item.cap)}
                    </td>

                    {/* Max Supply */}
                    <td className="px-4 py-2">
                      {renderMaxSupply(item.cap, item.amount, item.premine)}
                    </td>
                    {/* Mint Transactions */}
                    <td className="px-4 py-2">
                      {renderLargeNumber(item.mints)}
                    </td>
                    {/* Premine */}
                    <td className="px-4 py-2">
                      {renderLargeNumber(
                        parseInt(item.premine) > 0 ? item.premine : "-"
                      )}
                    </td>
                    {/* Divisibility */}
                    {/* <td className="px-4 py-2">{item.divisibility}</td> */}
                    {/* Mintable */}
                    <td className="px-4 py-2">
                      {item.mintable === "true" &&
                      parseInt(item.end) >= blockCount
                        ? "🟩"
                        : "🟥"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
