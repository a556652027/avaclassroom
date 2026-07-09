function getHostURL() {
  const url = Cyberspacae.Client.getHostname()

  if (url.includes('127') || url.includes('192'))
    return `http://192.168.1.240/jensen/`
  else if (url.includes('bamb')) return `https://www.bamb.asia/bamboo/`
}
