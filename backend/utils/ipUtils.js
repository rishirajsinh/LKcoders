const ipaddr = require('ipaddr.js');

/**
 * Checks if two IP addresses are in the same /24 subnet (e.g. 192.168.1.x)
 * or if they are identical (for Cloud/Public IP scenarios).
 * @param {string} ip1 - First IP (e.g. Student)
 * @param {string} ip2 - Second IP (e.g. Teacher)
 * @returns {boolean}
 */
const isSameSubnet = (ip1, ip2) => {
  try {
    if (!ip1 || !ip2) return false;

    // Normalize IPv6 mapped IPv4 addresses
    const addr1 = ipaddr.process(ip1.replace('::ffff:', ''));
    const addr2 = ipaddr.process(ip2.replace('::ffff:', ''));

    // If identical, they are definitely "together"
    if (addr1.toString() === addr2.toString()) return true;

    // For local networks, check /24 subnet
    if (addr1.kind() === 'ipv4' && addr2.kind() === 'ipv4') {
      const octets1 = addr1.toByteArray();
      const octets2 = addr2.toByteArray();
      return (
        octets1[0] === octets2[0] &&
        octets1[1] === octets2[1] &&
        octets1[2] === octets2[2]
      );
    }

    return false;
  } catch (err) {
    console.error('IP Comparison Error:', err);
    return false;
  }
};

module.exports = { isSameSubnet };
