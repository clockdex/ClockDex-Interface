type Props = {
  className?: string
  width?: string
  height?: string
}
const TransferIcon: React.FC<Props> = () => {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path
          d="M6.4615 9.80908C6.43595 9.74761 6.39946 9.6926 6.35296 9.6461L4.85348 8.14662C4.65799 7.95113 4.34199 7.95113 4.1465 8.14662C3.95101 8.34161 3.95101 8.65811 4.1465 8.8536L4.79299 9.50009H3.99999C3.17301 9.50009 2.50001 8.82709 2.50001 8.00011V3.0002C3.05151 3.0002 3.50001 2.5517 3.50001 2.00021V1.00024C3.50001 0.448737 3.05151 0.000244141 2.50001 0.000244141H1.50005C0.948546 0.000244141 0.500053 0.448737 0.500053 1.00024V2.00023C0.500053 2.55173 0.948546 3.00022 1.50005 3.00022V8.00014C1.50005 9.37861 2.62154 10.5001 4.00001 10.5001H4.79301L4.14652 11.1466C3.95103 11.3416 3.95103 11.6581 4.14652 11.8536C4.24402 11.9511 4.37201 12.0001 4.50002 12.0001C4.62801 12.0001 4.75603 11.9511 4.85352 11.8536L6.35301 10.3541C6.39951 10.3076 6.436 10.2526 6.4615 10.1911C6.51201 10.0691 6.51201 9.9311 6.4615 9.80908Z"
          fill="currentColor"
        />
        <path
          d="M10.4999 8.99997V4.00006C10.4999 2.62158 9.37842 1.50009 7.99994 1.50009H7.20694L7.85343 0.853598C8.04892 0.658109 8.04892 0.342106 7.85343 0.146617C7.65794 -0.0488723 7.34194 -0.0488723 7.14645 0.146617L5.64697 1.6461C5.60047 1.6926 5.56397 1.74761 5.53848 1.80911C5.48797 1.9311 5.48797 2.06909 5.53848 2.19111C5.56397 2.25261 5.60047 2.30761 5.64697 2.35411L7.14645 3.8536C7.24395 3.9511 7.37194 4.0001 7.49995 4.0001C7.62797 4.0001 7.75596 3.9511 7.85345 3.8536C8.04894 3.65811 8.04894 3.34211 7.85345 3.14662L7.20697 2.50013H7.99996C8.82694 2.50013 9.49994 3.17312 9.49994 4.0001V9.00002C8.94844 9.00002 8.49994 9.44851 8.49994 10V11C8.49994 11.5515 8.94844 12 9.49994 12H10.4999C11.0514 12 11.4999 11.5515 11.4999 11V10C11.4999 9.44846 11.0514 8.99997 10.4999 8.99997Z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}

export default TransferIcon