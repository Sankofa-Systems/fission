const {
  split,
  combine
} = require('./vendor/sss')

module.exports = (req, res) => {
  try {
    switch (req.url) {
      case '/split':
        const {
          secret,
          numShares,
          numThreshold
        } = req.body
        const secretBuffer = Buffer.from(secret, 'hex')
        const splitShares =
          split(secretBuffer, { shares: numShares, threshold: numThreshold })
            .map(shareBuffer => shareBuffer.toString('hex'))
        res.json({
          shares: splitShares
        })
        break;
      case '/join':
        const shareBuffers = req.body.shares.map(hex => Buffer.from(hex, 'hex'))
        const joinedSecret =
          combine(shareBuffers)
            .toString('hex')
        res.json({
          secret: joinedSecret
        })
        break;
      default:
        res.status(400)
        res.end('Operation not supported')
        break;
    }
  } catch (err) {
    console.log(err)
    res.status(500)
    res.end()
  }
}
