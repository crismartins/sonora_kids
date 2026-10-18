import { ComponentType } from "react";
import { ColorValue } from "react-native";
import { AddIcon } from "@solar-icons/react-native/bold-duotone/add";
import { WidgetAddIcon } from "@solar-icons/react-native/bold-duotone/widget-add";
import { ChatSquareAddIcon } from "@solar-icons/react-native/bold-duotone/chat-square-add";
import { AltArrowLeftIcon } from "@solar-icons/react-native/bold-duotone/alt-arrow-left";
import { AltArrowRightIcon } from "@solar-icons/react-native/bold-duotone/alt-arrow-right";
import { BedIcon } from "@solar-icons/react-native/bold-duotone/bed";
import { BookIcon } from "@solar-icons/react-native/bold-duotone/book";
import { BoxIcon } from "@solar-icons/react-native/bold-duotone/box";
import { CameraIcon } from "@solar-icons/react-native/bold-duotone/camera";
import { ChatRoundIcon } from "@solar-icons/react-native/bold-duotone/chat-round";
import { ChatSquareLineIcon } from "@solar-icons/react-native/bold-duotone/chat-square-line";
import { CheckCircleIcon } from "@solar-icons/react-native/bold-duotone/check-circle";
import { CheckReadIcon } from "@solar-icons/react-native/bold-duotone/check-read";
import { ChefHatIcon } from "@solar-icons/react-native/bold-duotone/chef-hat";
import { ClockCircleIcon } from "@solar-icons/react-native/bold-duotone/clock-circle";
import { CloseIcon } from "@solar-icons/react-native/bold-duotone/close";
import { CloudCrossIcon } from "@solar-icons/react-native/bold-duotone/cloud-cross";
import { CloudDownloadIcon } from "@solar-icons/react-native/bold-duotone/cloud-download";
import { CloudSunIcon } from "@solar-icons/react-native/bold-duotone/cloud-sun";
import { FlagIcon } from "@solar-icons/react-native/bold-duotone/flag";
import { GalleryIcon } from "@solar-icons/react-native/bold-duotone/gallery";
import { GamepadIcon } from "@solar-icons/react-native/bold-duotone/gamepad";
import { HeartIcon } from "@solar-icons/react-native/bold-duotone/heart";
import { LeafIcon } from "@solar-icons/react-native/bold-duotone/leaf";
import { MagnifierIcon } from "@solar-icons/react-native/bold-duotone/magnifier";
import { MenuDotsVerticalIcon } from "@solar-icons/react-native/bold-duotone/menu-dots-vertical";
import { MicrophoneIcon } from "@solar-icons/react-native/bold-duotone/microphone";
import { MoonIcon } from "@solar-icons/react-native/bold-duotone/moon";
import { PenIcon } from "@solar-icons/react-native/bold-duotone/pen";
import { QuestionCircleIcon } from "@solar-icons/react-native/bold-duotone/question-circle";
import { SettingsIcon } from "@solar-icons/react-native/bold-duotone/settings";
import { SmileCircleIcon } from "@solar-icons/react-native/bold-duotone/smile-circle";
import { SmartphoneVibrationIcon } from "@solar-icons/react-native/bold-duotone/smartphone-vibration";
import { SpeedometerMiddleIcon } from "@solar-icons/react-native/bold-duotone/speedometer-middle";
import { SquareAcademicCapIcon } from "@solar-icons/react-native/bold-duotone/square-academic-cap";
import { StarIcon } from "@solar-icons/react-native/bold-duotone/star";
import { SunIcon } from "@solar-icons/react-native/bold-duotone/sun";
import { TextFieldIcon } from "@solar-icons/react-native/bold-duotone/text-field";
import { TrashBinTrashIcon } from "@solar-icons/react-native/bold-duotone/trash-bin-trash";
import { UserRoundedIcon } from "@solar-icons/react-native/bold-duotone/user-rounded";
import { VolumeIcon } from "@solar-icons/react-native/bold-duotone/volume";
import { VolumeCrossIcon } from "@solar-icons/react-native/bold-duotone/volume-cross";
import { VolumeLoudIcon } from "@solar-icons/react-native/bold-duotone/volume-loud";
import { VolumeSmallIcon } from "@solar-icons/react-native/bold-duotone/volume-small";
import { WaterdropIcon } from "@solar-icons/react-native/bold-duotone/waterdrop";
import { WidgetIcon } from "@solar-icons/react-native/bold-duotone/widget";

type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  secondaryColor?: string;
  secondaryOpacity?: number;
}>;

function asColor(value: ColorValue | undefined) {
  return value == null ? undefined : String(value);
}

const ICONS = {
  add: AddIcon,
  "widget-add": WidgetAddIcon,
  "chat-square-add": ChatSquareAddIcon,
  "alt-arrow-left": AltArrowLeftIcon,
  "alt-arrow-right": AltArrowRightIcon,
  bed: BedIcon,
  book: BookIcon,
  box: BoxIcon,
  camera: CameraIcon,
  "chat-round": ChatRoundIcon,
  "chat-square-line": ChatSquareLineIcon,
  check: CheckReadIcon,
  "check-circle": CheckCircleIcon,
  "chef-hat": ChefHatIcon,
  clock: ClockCircleIcon,
  close: CloseIcon,
  "cloud-cross": CloudCrossIcon,
  "cloud-download": CloudDownloadIcon,
  "cloud-sun": CloudSunIcon,
  /** Sem equivalente direto na Solar Duotone. Troque depois pelo ícone do layout. */
  fallback: QuestionCircleIcon,
  flag: FlagIcon,
  gallery: GalleryIcon,
  gamepad: GamepadIcon,
  heart: HeartIcon,
  leaf: LeafIcon,
  magnifier: MagnifierIcon,
  "menu-dots-vertical": MenuDotsVerticalIcon,
  microphone: MicrophoneIcon,
  moon: MoonIcon,
  pen: PenIcon,
  settings: SettingsIcon,
  smile: SmileCircleIcon,
  speedometer: SpeedometerMiddleIcon,
  "square-academic-cap": SquareAcademicCapIcon,
  star: StarIcon,
  sun: SunIcon,
  "text-field": TextFieldIcon,
  trash: TrashBinTrashIcon,
  user: UserRoundedIcon,
  vibration: SmartphoneVibrationIcon,
  volume: VolumeIcon,
  "volume-cross": VolumeCrossIcon,
  "volume-loud": VolumeLoudIcon,
  "volume-small": VolumeSmallIcon,
  waterdrop: WaterdropIcon,
  widget: WidgetIcon,
} satisfies Record<string, IconComponent>;

export type SolarIconName = keyof typeof ICONS;

type SolarIconProps = {
  name: SolarIconName;
  size?: number;
  color?: ColorValue;
  secondaryColor?: ColorValue;
  secondaryOpacity?: number;
};

export function SolarIcon({ name, size, color, secondaryColor, secondaryOpacity = 0.4 }: SolarIconProps) {
  const Icon = ICONS[name] ?? ICONS.fallback;
  const tint = asColor(color);
  return (
    <Icon
      size={size}
      color={tint}
      secondaryColor={asColor(secondaryColor) ?? tint}
      secondaryOpacity={secondaryOpacity}
    />
  );
}
