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

  // useEffect does not directly support async/await, so we define an async function inside it
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/runes`, {
          headers: {
            "Content-Type": "application/json",
            // Include other necessary headers
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await res.json();

        setBlockCount(result.blockCount);
        // Assuming `result.data` is the array you want to sort
        // and that it's available directly under the `result` object.
        // Adjust the path if your data structure is different.
        if (result && result.data) {
          // Sort data by rune number in ascending order
          // @ts-ignore
          const sortedData = result.data.sort((a, b) => a.number - b.number);
          setData(sortedData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Fetching data failed:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, []); // The empty array means this effect runs once on mount

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

  return (
    <div className="flex-1 w-full flex flex-col items-center pb-8 px-4">
      <div className="mt-6 flex flex-row gap-2 items-center justify-center">
        <Logo />
        <div className="text-sm">(signet)</div>
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
        <div className="w-full overflow-x-auto mt-6">
          <table className="min-w-full divide-y table-auto text-center">
            <thead>
              <tr>
                <th className="text-left px-4 py-2">Rune</th>{" "}
                <th className="px-4 py-2">Supply per mint</th>
                <th className="px-4 py-2">Circulating Supply</th>
                <th className="px-4 py-2">Mint transactions</th>
                <th className="px-4 py-2">Max Supply</th>
                <th className="px-4 py-2">
                  Premine{" "}
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={togglePremineVisibility}
                  >
                    {hidePremineRows ? "👀" : "🚫"}
                  </span>
                </th>
                {/* <th className="px-4 py-2">Divisibility</th> */}
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
                      href={`https://signet.ordinals.com/rune/${item.title}`}
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
                      {renderLargeNumber(item.mints)}
                    </td>

                    {/* Max Supply */}
                    <td className="px-4 py-2">
                      {renderLargeNumber(
                        (
                          parseInt(item.cap) * parseInt(item.amount) +
                          parseInt(item.premine)
                        ).toString()
                      )}
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
